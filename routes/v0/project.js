const express = require('express');
const router = express.Router();
const MulterHelper = require('../../constants/multer');
const Project = require('../../models/project.model');
const ContentPreview = require('../../models/content.preview.model');
const Post = require('../../models/post.model');
const Ref = require('../../models/ref.model');
const Helper = require('../../utils/helper');
const {
    validateQueryProjectIDList,
    validateBodyUsername,
    validateBodyUserID,
    validateBodyIndexUserID,
    validateBodySelectedPosts,
    validateBodyTitle,
    doesValidationErrorExist,
    validateQueryProjectID,
    validateBodyProjectData,
    validateBodyDisplayPhoto,
} = require('../../utils/validators');
const { retrieveIndexUserByID, retrieveUserByID, findProjectByID, findProjectsByID, findPostInList } = require('../../data_access/dal');

router.route('/')
    .post(
        MulterHelper.contentImageUpload.single({ name: "coverPhoto", maxCount: 1 }),
        validateBodyUsername,
        validateBodyUserID,
        validateBodyIndexUserID,
        validateBodySelectedPosts,
        validateBodyTitle,
        doesValidationErrorExist,
        (req, res, next) => {
            const username = req.body.username;
            const displayPhoto = req.body.displayPhoto;
            const userID = req.body.userID;
            const indexUserID = req.body.indexUserID;
            const selectedPosts = req.body.selectedPosts ? JSON.parse(req.body.selectedPosts) : [];
            const title = req.body.title ? req.body.title : null;
            const overview = req.body.overview ? req.body.overview : null;
            const pursuit = req.body.pursuit ? req.body.pursuit : null;
            const startDate = req.body.startDate ? req.body.startDate : null;
            const endDate = req.body.endDate ? req.body.endDate : null;
            const isComplete = req.body.isComplete ? req.body.isComplete : null;
            const minDuration = req.body.minDuration ? req.body.minDuration : null;
            const coverPhotoURL = req.files ? req.files.coverPhoto[0].key : null;

            const newProject = new Project.Model({
                username: username,
                author_id: indexUserID,
                display_photo_key: displayPhoto,
                title: title,
                overview: overview,
                pursuit: pursuit,
                start_date: startDate,
                end_date: endDate,
                is_complete: isComplete,
                min_duration: minDuration,
                cover_photo_key: coverPhotoURL,
                post_ids: selectedPosts,
            });

            const resolvedIndexUser =
                retrieveIndexUserByID(indexUserID)
                    .then(result => {
                        let user = result;
                        if (pursuit) {
                            for (const pursuit of user.pursuits) {
                                if (pursuit.name === newProject.pursuit) {
                                    pursuit.num_projects++;
                                }
                            }
                        }
                        else {
                            user.pursuits[0].num_projects++;
                        }

                        return user;
                    });

            const resolvedUser =
                retrieveUserByID(userID)
                    .then((result => {
                        let user = result;
                        for (const pursuit of user.pursuits) {
                            if (pursuit.name === newProject.pursuit) {
                                pursuit.projects.unshift(
                                    new ContentPreview.Model({
                                        post_id: newProject._id,
                                    })
                                );
                            }
                        }
                        return user;

                    }));

            return Promise.all([resolvedIndexUser, resolvedUser])
                .then((result) => {
                    const savedIndexUser = result[0].save();
                    const savedUser = result[1].save();
                    const savedProject = newProject.save();
                    return (Promise.all([savedIndexUser, savedUser, savedProject]));
                })
                .then((result) => {
                    return res.status(201).send();
                })
                .catch(next)

        });

router.route('/single').get(
    validateQueryProjectID,
    doesValidationErrorExist,
    (req, res, next) => {
        const projectID = req.query.projectID;
        return findProjectByID(projectID)
            .then(
                (result) => {
                    return res.status(200).json({ project: result });
                }
            )
            .catch(next)
    }
);


router.route('/multiple').get(
    validateQueryProjectIDList,
    doesValidationErrorExist,
    (req, res, next) => {
        const projectIDList = req.query.projectIDList;
        return findProjectsByID(projectIDList)
            .then(
                (results) => {
                    return res.status(200).json({ projects: results });
                }
            )
            .catch(next)
    }
);
const returnMappedDuplicate = (id, imageKeyMap) => {
    return Helper.copyObject(id).then((res => {
        imageKeyMap.set(id, res.Key);
        return res.Key;
    }));
}

const extractImageURLs = (posts) => {
    let imageArray = [];
    for (post of posts) {
        if (post.image_data.length > 0) {
            imageArray = imageArray.concat(post.image_data);
        }
    }
    return imageArray;
}

const refreshPostImageData = (posts, imageKeyMap) => {
    for (post of posts) {
        if (post.image_data.length > 0) {
            post.image_data = post.image_data.map(id => imageKeyMap.get(id));
        }
    }
}
router.route('/fork').put(
    validateBodyProjectData,
    validateBodyUsername,
    validateBodyIndexUserID,
    validateBodyUserID,
    // validateBodyDisplayPhoto,
    doesValidationErrorExist,
    (req, res, next) => {
        const projectData = req.body.projectData;
        const username = req.body.username;
        const authorID = req.body.indexUserID;
        const userID = req.body.userID;
        const displayPhoto = req.body.displayPhoto;
        const oldProjectID = projectData._id;
        const ancestors = projectData.ancestors;
        const newPostIDList = [];
        const imageKeyMap = new Map();
        let projectPosts = null;
        res.locals.indexUserID = authorID;
        console.log(userID);
        res.locals.userID = userID;

        delete projectData._id;
        delete projectData.username;
        delete projectData.index_user_id;
        ancestors.push(oldProjectID);
        const newProject = new Project.Model({
            ...projectData,
            index_user_id: authorID,
            username: username,
            parent: oldProjectID,
            ancestors: ancestors
        });
        return findPostInList(projectData.post_ids, true)
            .then((results) => {
                projectPosts = results;
                projectPosts.sort((a, b) =>
                    projectData.post_ids.findIndex(id => a._id.equals(id)) -
                    projectData.post_ids.findIndex(id => b._id.equals(id)));
                //sort posts to order of postIDs
                //dupe to the new list
                // first duplicate posts
                for (let i = 0; i < projectPosts.length; i++) {
                    const post = projectPosts[i];
                    const oldPostID = post._id;

                    delete post._id;
                    delete post.comments;
                    delete post.date;
                    delete post.createdAt;
                    delete post.updatedAt;
                    const duplicate = new Post.Model({
                        ...post,
                        author_id: authorID,
                        username: username,
                        display_photo_key: displayPhoto,
                        post_format: "SHORT",
                        internal_ref: {
                            id: newProject._id,
                            title: newProject.title
                        },
                        external_ref: {
                            id: oldPostID,
                            title: projectData.title
                        },
                        labels: [],
                        comments: []
                    });
                    newPostIDList.push(duplicate._id);
                    projectPosts[i] = duplicate;
                    // console.log(post._id);
                    // duplicate.authorID = authorID;
                    // duplicate.username = username;
                    // duplicate.display_photo_key = displayPhoto;

                }
                newProject.post_ids = newPostIDList;

                const imageURLs = extractImageURLs(projectPosts);
                const promisedDuplicates = imageURLs.map(url => returnMappedDuplicate(url, imageKeyMap));
                // throw new Error();
                return Promise.all(promisedDuplicates);
            })
            .then(response => {
                refreshPostImageData(projectPosts, imageKeyMap);
                return Promise.all([Post.Model.insertMany(projectPosts), newProject.save()])
            })
            .then(() => {
                res.locals.project = newProject;
                next();
                // return res.status(201).json()
            })
            .catch(err => {
                console.log(err);
                return res.status(400);

            });
    },
    (req, res, next) => {
        console.log(res.locals.pursuits);
        const project = res.locals.project;
        // const promisedUserInfo = Promise.all([retrieveIndexUserByID(res.locals.indexUserID), retrieveUserByID(res.locals.userID)]);
        const promisedUserInfo = retrieveUserByID(res.locals.userID);
        return promisedUserInfo.then(
            result => {
                console.log(result);
                for (let i = 1; i < result.pursuits.length; i++) {
                    if (result.pursuits[i].name === project.pursuit) {
                        result.pursuits[i].projects.unshift(new ContentPreview.Model({
                            post_id: project._id,
                            date: new Date().toISOString(),
                            labels: project.labels,
                        }))
                    }
                }
                result.pursuits[0].projects.unshift(new ContentPreview.Model({
                    post_id: project._id,
                    date: new Date().toISOString(),
                    labels: project.labels,
                }));
                return result.save();
            }
        )
        .then(result => res.status(200).send())
    }
)
module.exports = router;

