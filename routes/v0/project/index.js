const express = require('express');
const router = express.Router();
const Helper = require('../../../shared/helper');
const selectModel = require('../../../models/modelServices');
const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    buildBodyValidationChain,
    doesValidationErrorExist,
} = require('../../../shared/validators/validators');
const {
    findByID,
    findManyByID,
    insertMany,
} = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const {
    updateParentProject,
    retrieveSpotlightProjects,
    removeVote } = require('./services');
const create = require('./create');
const find = require('./find');
const update = require('./update');
const deletion = require('./delete');
const MulterHelper = require('../../../shared/utils/multer');

router.route('/')
    .post(
        MulterHelper
            .contentImageUpload
            .single(
                {
                    name: "coverPhoto",
                    maxCount: 1
                }),
        buildBodyValidationChain(
            PARAM_CONSTANTS.PURSUIT,
            PARAM_CONSTANTS.USERNAME,
            PARAM_CONSTANTS.USER_ID,
            PARAM_CONSTANTS.INDEX_USER_ID,
            PARAM_CONSTANTS.USER_PREVIEW_ID,
            PARAM_CONSTANTS.TITLE,
            PARAM_CONSTANTS.STATUS,
        ),
        doesValidationErrorExist,
        find,
        create)
    .put(
        MulterHelper
            .contentImageUpload
            .single(
                {
                    name: "coverPhoto",
                    maxCount: 1
                }),
        buildBodyValidationChain(
            PARAM_CONSTANTS.PROJECT_ID,
            PARAM_CONSTANTS.PROJECT_PREVIEW_ID,
            PARAM_CONSTANTS.TITLE,
            PARAM_CONSTANTS.STATUS,
            PARAM_CONSTANTS.IS_FORKED
        ),
        doesValidationErrorExist,
        update)
    .delete(
        buildQueryValidationChain(
            PARAM_CONSTANTS.PROJECT_ID,
            PARAM_CONSTANTS.SHOULD_DELETE_POSTS,
            PARAM_CONSTANTS.INDEX_USER_ID,
            PARAM_CONSTANTS.USER_PREVIEW_ID,
            PARAM_CONSTANTS.USER_ID,
        ),
        doesValidationErrorExist,
        deletion.getImageKeys,
        deletion.callMulter,
        deletion.updateIndexes
    );

router.route('/single').get(
    buildQueryValidationChain(
        PARAM_CONSTANTS.PROJECT_ID,
    ),
    doesValidationErrorExist,
    (req, res, next) => {
        const projectID = req.query.projectID;
        return findByID(ModelConstants.PROJECT, projectID)
            .then(
                (result) => {
                    return res.status(200).json({ project: result });
                }
            )
            .catch(next)
    }
);


router.route('/multiple').get(
    buildQueryValidationChain(
        PARAM_CONSTANTS.PROJECT_ID_LIST,
    ),
    doesValidationErrorExist,
    (req, res, next) => {
        const projectIDList = req.query.projectIDList;
        return findManyByID(ModelConstants.PROJECT, projectIDList)
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
    buildBodyValidationChain(
        PARAM_CONSTANTS.PROJECT_DATA,
        PARAM_CONSTANTS.TITLE,
        PARAM_CONSTANTS.USERNAME,
        PARAM_CONSTANTS.INDEX_USER_ID,
        PARAM_CONSTANTS.USER_ID,
        PARAM_CONSTANTS.SHOULD_COPY_POSTS
    ),
    doesValidationErrorExist,
    (req, res, next) => {
        const resolvedProject = findByID(ModelConstants.PROJECT, req.body.projectData._id);
        return resolvedProject.then(
            result => {
                res.locals.oldProject = result;
                return next();
            }
        )

    },
    (req, res, next) => {
        let projectData = res.locals.oldProject.toObject();
        const username = req.body.username;
        const authorID = req.body.indexUserID;
        const displayPhoto = req.body.displayPhotoKey;
        const title = req.body.title;
        const remix = req.body.remix;
        const shouldCopyPosts = req.body.shouldCopyPosts;
        const oldProjectID = projectData._id;
        const oldProjectRemix = projectData.remix ? projectData.remix : null;
        const ancestors = [...projectData.ancestors];
        const newPostIDList = [];
        const imageKeyMap = new Map();
        let projectPosts = null;

        ancestors.push(
            selectModel(ModelConstants.PROJECT_PREVIEW_NO_ID)
                ({
                    title: projectData.title,
                    remix: oldProjectRemix,
                    project_id: oldProjectID,
                    parent_project_id: projectData._id
                })
        );

        delete projectData.cover_photo_key;
        delete projectData._id;
        delete projectData.username;
        delete projectData.children;
        delete projectData.children_length;
        delete projectData.labels;

        let newProject = (selectModel(ModelConstants.PROJECT))({
            ...projectData,
            index_user_id: authorID,
            display_photo_key: displayPhoto,
            username: username,
            ancestors: ancestors,
            status: 'DRAFT',
            title: title,
            remix: remix
        });

        const newProjectPreview = selectModel(ModelConstants.PROJECT_PREVIEW_WITH_ID)
            ({
                title: newProject.title,
                remix: newProject.remix,
                project_id: newProject._id,
                parent_project_id: oldProjectID,
                status: 'DRAFT',
                labels: []
            });

        newProject.project_preview_id = newProjectPreview._id;
        res.locals.title = newProject.title;
        res.locals.id = newProject._id;
        res.locals.newProjectPreview = newProjectPreview;

        if (shouldCopyPosts) {
            return findManyByID(ModelConstants.POST, projectData.post_ids, true)
                .then((results) => {
                    projectPosts = results;
                    projectPosts.sort((a, b) =>
                        projectData.post_ids.findIndex(id => a._id.equals(id)) -
                        projectData.post_ids.findIndex(id => b._id.equals(id)));
                    for (let i = 0; i < projectPosts.length; i++) {
                        const post = projectPosts[i];
                        const oldPostID = post._id;
                        delete post._id;
                        delete post.comments;
                        delete post.date;
                        delete post.createdAt;
                        delete post.updatedAt;
                        const duplicate = selectModel(ModelConstants.POST)
                            ({
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
                    }
                    newProject.post_ids = newPostIDList;

                    const imageURLs = extractImageURLs(projectPosts);
                    const promisedDuplicates = imageURLs.map(url => returnMappedDuplicate(url, imageKeyMap));
                    return Promise.all(promisedDuplicates);
                })
                .then(response => {
                    refreshPostImageData(projectPosts, imageKeyMap);
                    res.locals.project = newProject;

                    res.locals.oldProject = updateParentProject(
                        res.locals.oldProject,
                        newProject._id,
                        title,
                        remix);
                    return insertMany(
                        ModelConstants.POST, projectPosts, { ordered: true })
                })
                .then(() => {

                    next();
                })
                .catch(next);
        }
        else {
            newProject.post_ids = [];
            res.locals.project = newProject;
            res.locals.oldProject = updateParentProject(
                res.locals.oldProject,
                newProject._id,
                title,
                remix);
            next();
        }
    },
    (req, res, next) => {
        const oldProject = res.locals.oldProject;
        const project = res.locals.project;
        const newProjectPreview = res.locals.newProjectPreview;
        const promisedUserInfo = findByID(ModelConstants.USER, req.body.userID);
        const promisedIndexUser = findByID(ModelConstants.INDEX_USER, req.body.indexUserID)
        return Promise.all([promisedUserInfo, promisedIndexUser])
            .then(results => {
                const user = results[0];
                const indexUser = results[1];
                user.pursuits[0].projects.unshift(
                    (selectModel(ModelConstants.CONTENT_PREVIEW)(
                        {
                            content_id: project._id,
                            date: new Date().toISOString().substr(0, 10),
                            labels: project.labels,
                        })));
                for (let i = 1; i < user.pursuits.length; i++) {
                    if (user.pursuits[i].name === project.pursuit) {
                        user.pursuits[i].projects.unshift(
                            (selectModel(ModelConstants.CONTENT_PREVIEW)
                                (
                                    {
                                        content_id: project._id,
                                        date: new Date().toISOString().substr(0, 10),
                                        labels: project.labels,
                                    }))
                        )
                    }
                }
                indexUser.drafts.unshift(
                    (selectModel(ModelConstants.DRAFT_PREVIEW)
                        ({
                            title: res.locals.title,
                            content_id: res.locals.id
                        }))
                )
                return Promise.all([
                    user.save(),
                    indexUser.save(),
                    oldProject.save(),
                    project.save(),
                    newProjectPreview.save()
                ]);
            })
            .then(result => res.status(200).send())
            .catch(next);
    }
)

router.route('/spotlight')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.QUANTITY,
            PARAM_CONSTANTS.PURSUIT_ARRAY,
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const quantity = parseInt(req.query.quantity);
            const pursuitArray = req.query.pursuitArray;
            return retrieveSpotlightProjects(quantity)
                .then(results => res.status(200).json({ projects: results }))
                .catch(next);
        }
    );

router.route('/vote')
    .put(
        buildBodyValidationChain(
            PARAM_CONSTANTS.PROJECT_ID,
            PARAM_CONSTANTS.VOTE_VALUE,
            PARAM_CONSTANTS.USER_PREVIEW_ID
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const projectID = req.body.projectID;
            const voteValue = req.body.voteValue;
            const userPreviewID = req.body.userPreviewID;
            return findByID(ModelConstants.PROJECT, projectID)
                .then(
                    results => {
                        if (!results) throw new Error(204);
                        switch (voteValue) {
                            case (-1):
                                results.dislikes.push(userPreviewID);
                                results.likes = removeVote(results.likes, userPreviewID);
                                break;
                            case (1):
                                results.likes.push(userPreviewID);
                                results.dislikes = removeVote(results.dislikes, userPreviewID);
                                break;
                            case (-2):
                                results.dislikes = removeVote(results.dislikes, userPreviewID);
                                break;
                            case (2):
                                results.likes = removeVote(results.likes, userPreviewID);
                                break;
                            default:
                                console.log("Nothing matched?");
                                throw new Error("Nothing matched for vote value");
                        }
                        return results.save()
                    }
                )
                .then(results => res.status(200).send());
        }
    );
    // router.route('/bookmark').put(
    //     (req, res, next) => {
    //         const 
    //     }
    // )

// router.route('/bookmark')
//     .put(
//         buildBodyValidationChain(
//             PARAM_CONSTANTS.BOOKMARK_STATE,
//             PARAM_CONSTANTS.PROJECT_ID,
//             PARAM_CONSTANTS.USER_PREVIEW_ID,
//         ),
//         doesValidationErrorExist,
//         (req, res, next) => {
//             const projectID = req.body.projectID;
//             const userPreviewID = req.body.userPreviewID;
//             const bookmarkState = req.body.bookmarkState;
//             if (bookmarkState)
//                 return findByID(ModelConstants.PROJECT, projectID)
//                     .then(result => {
//                         if (!result) throw new Error("No Content");
//                         result.bookmarks.push(userPreviewID);
//                         const newBookmark = (selectModel(ModelConstants.BOOKMARK)
//                             ({
//                                 user_preview_id: userPreviewID,
//                                 content_type: ModelConstants.PROJECT,
//                                 content_id: projectID,
//                             }));
//                         return Promise.all([
//                             result.save(),
//                             newBookmark.save()
//                         ])
//                     })
//                     .then(results => res.status(201).send())
//                     .catch(next);
//             else {
//                 return findByID(ModelConstants.PROJECT, projectID)
//                     .then(result => {
//                         if (!result) throw new Error("No Content");
//                         result.bookmarks = result.bookmarks.filter(item => item.toString() !== userPreviewID);
//                         return Promise.all([
//                             result.save(),
//                             deleteOne(ModelConstants.BOOKMARK,
//                                 { content_id: projectID, user_preview_id: userPreviewID })
//                         ])
//                     })
//                     .then(results => res.status(201).send())
//                     .catch(next)
//             }
//         }
//     );


module.exports = router;

