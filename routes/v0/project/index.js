const express = require('express');
const router = express.Router();
const MulterHelper = require('../../../shared/utils/multer');
const Helper = require('../../../shared/helper');
const selectModel = require('../../../models/modelServices');
const imageServices = require('../image/services');
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
    deleteManyByID,
    deleteByID,
    findByIDAndUpdate,
    deleteOne
} = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const { findAndUpdateIndexUserMeta, partialDelete, updateParentProject, retrieveSpotlightProjects, updatePursuitObject, removeVote } = require('./services');
const { ADD, SUBTRACT } = require('./constants');

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
            PARAM_CONSTANTS.USERNAME,
            PARAM_CONSTANTS.USER_ID,
            PARAM_CONSTANTS.INDEX_USER_ID,
            PARAM_CONSTANTS.USER_PREVIEW_ID,
            PARAM_CONSTANTS.TITLE,
            PARAM_CONSTANTS.STATUS

        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const username = req.body.username;
            const displayPhoto = req.body.displayPhoto;
            const userID = req.body.userID;
            const indexUserID = req.body.indexUserID;
            const userPreviewID = req.body.userPreviewID;
            const status = req.body.status;
            const selectedPosts = req.body.selectedPosts ?
                req.body.selectedPosts : [];
            const title = req.body.title ? req.body.title : null;
            const overview = req.body.overview ? req.body.overview : null;
            const pursuit = req.body.pursuit ? req.body.pursuit : null;
            const startDate = req.body.startDate ? req.body.startDate : null;
            const endDate = req.body.endDate ? req.body.endDate : null;
            const minDuration = req.body.minDuration ? req.body.minDuration : null;
            const coverPhotoURL = req.files ? req.files.coverPhoto[0].key : null;

            const newProject = selectModel(ModelConstants.PROJECT)
                (
                    {
                        username: username,
                        index_user_id: indexUserID,
                        display_photo_key: displayPhoto,
                        title: title,
                        overview: overview,
                        pursuit: pursuit,
                        start_date: startDate,
                        end_date: endDate,
                        status: status,
                        min_duration: minDuration,
                        cover_photo_key: coverPhotoURL,
                        post_ids: selectedPosts,
                    });

            const resolvedIndexUser = findAndUpdateIndexUserMeta(indexUserID, pursuit, ADD);
            const resolvedUserPreview = updatePursuitObject(
                ModelConstants.USER_PREVIEW,
                userPreviewID,
                newProject._id,
                newProject.pursuit
            );
            const resolvedUser = updatePursuitObject(ModelConstants.USER, userID, newProject._id);

            return Promise.all([resolvedIndexUser, resolvedUser, resolvedUserPreview])
                .then((result) => {
                    const savedIndexUser = result[0].save();
                    const savedUser = result[1].save();
                    const savedUserPreview = result[2].save();
                    const savedProject = newProject.save();
                    return Promise.all([
                        savedIndexUser,
                        savedUser,
                        savedUserPreview,
                        savedProject
                    ]);
                })
                .then((result) => {
                    return res.status(201).send(newProject._id);
                })
                .catch(next)

        })
    .put(
        MulterHelper.contentImageUpload.single("coverPhoto"),
        buildBodyValidationChain(
            PARAM_CONSTANTS.PROJECT_ID,
            PARAM_CONSTANTS.TITLE,
            PARAM_CONSTANTS.STATUS

        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const updates = {};
            req.file ? updates.cover_photo_key = req.file.key : null;
            req.body.title ? updates.title = req.body.title : null;
            req.body.overview ? updates.overview = req.body.overview : null;
            req.body.pursuit ? updates.pursuit = req.body.pursuit : null;
            req.body.startDate ? updates.start_date = req.body.startDate : null;
            req.body.endDate ? updates.end_date = req.body.endDate : null;
            req.body.status ? updates.status = req.body.status : null;
            req.body.minDuration ? updates.min_duration = req.body.minDuration : null;
            req.body.selectedPosts ? updates.post_ids = req.body.selectedPosts : null;
            req.body.labels ? updates.labels = req.body.labels : null;
            console.log(req.body.pursuit);

            return findByIDAndUpdate(
                ModelConstants.PROJECT,
                req.body.projectID,
                updates)
                .then((result) => {
                    return res.status(200).send();
                });
        })
    .delete(
        buildQueryValidationChain(
            PARAM_CONSTANTS.PROJECT_ID,
            PARAM_CONSTANTS.SHOULD_DELETE_POSTS,
            PARAM_CONSTANTS.INDEX_USER_ID,
            PARAM_CONSTANTS.USER_PREVIEW_ID,
            PARAM_CONSTANTS.USER_ID,
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const projectID = req.query.projectID;
            let toBeDeletedImages = [];
            res.locals.shouldDeletePosts = req.query.shouldDeletePosts === 'true'
                || req.query.shouldDeletePost === true;
            return findByID(ModelConstants.PROJECT, projectID)
                .then((result) => {
                    if (result.cover_photo_key) {
                        toBeDeletedImages.push(result.cover_photo_key);
                    }
                    res.locals.project = result;
                    res.locals.toBeDeletedPosts = result.post_ids;
                    res.locals.pursuit = result.pursuit;
                    return findManyByID(ModelConstants.POST, result.post_ids)
                })
                .then((results) => {
                    for (const post of results) {
                        if (post.cover_photo_key) {
                            toBeDeletedImages.push(post.cover_photo_key);
                        }
                        if (post.image_data) {
                            toBeDeletedImages = toBeDeletedImages.concat(post.image_data)
                        }
                    }
                    res.locals.toBeDeletedImages = toBeDeletedImages;
                    return next();
                })
        },
        (req, res, next) => {
            const imagesExist = res.locals.toBeDeletedImages.length > 0;
            if (res.locals.shouldDeletePosts && imagesExist) {
                return imageServices.deleteMultiple(res.locals.toBeDeletedImages)
                    .then(next)
                    .catch(next);
            }
            return next();
        },
        (req, res, next) => {
            const _removeProject = (array, ID) => {
                for (let i = 0; i < array.length; i++) {
                    console.log(array[i]);
                    if (array[i].content_id.toString() === ID) {

                        array.splice(i, 1)
                    }
                }
            }
            const indexUserID = req.query.indexUserID;
            const userID = req.query.userID;
            const userPreviewID = req.query.userPreviewID;
            const shouldPreserve = res.locals.project.children.length > 0;
            let promisedDeletionProcess = null;

            if (shouldPreserve) {
                promisedDeletionProcess = Promise.all([
                    findAndUpdateIndexUserMeta(indexUserID, res.locals.pursuit, SUBTRACT),
                    findByID(ModelConstants.USER, userID),
                    findByID(ModelConstants.USER_PREVIEW, userPreviewID),
                ])
            }
            else {
                promisedDeletionProcess = Promise.all([
                    findAndUpdateIndexUserMeta(indexUserID, res.locals.pursuit, SUBTRACT),
                    findByID(ModelConstants.USER, userID),
                    findByID(ModelConstants.USER_PREVIEW, userPreviewID),
                    findByID(ModelConstants.PROJECT, res.locals.project.parent)
                ])
            }

            return promisedDeletionProcess
                .then((results => {
                    const indexUser = results[0];
                    const completeUser = results[1];
                    const userPreview = results[2];

                    _removeProject(completeUser.pursuits[0].projects, req.query.projectID);
                    for (let i = 1; i < completeUser.pursuits.length; i++) {
                        if (completeUser.pursuits[i].name === res.locals.pursuit) {
                            _removeProject(completeUser.pursuits[i].projects, req.query.projectID)
                        }
                    }
                    _removeProject(userPreview.pursuits[0].projects, req.query.projectID);
                    for (let i = 1; i < userPreview.pursuits.length; i++) {
                        if (userPreview.pursuits[i].name === res.locals.pursuit) {
                            _removeProject(userPreview.pursuits[i].projects, req.query.projectID)
                        }
                    }
                    if (shouldPreserve) {
                        return Promise.all([
                            res.locals.shouldDeletePosts ?
                                deleteManyByID(ModelConstants.POST, res.locals.toBeDeletedPosts) : null,
                            partialDelete(res.locals.project).save(),
                            indexUser.save(),
                            completeUser.save(),
                            userPreview.save()
                        ])
                    }
                    else {
                        let oldProject = results[3];
                        const childrenLength = oldProject.children.length;
                        oldProject.children = oldProject.children
                            .filter(item => item.toString() !== req.query.projectID);
                        oldProject.children_length = oldProject.children_length - 1;
                        if (childrenLength === oldProject.children.length
                            || oldProject.children_length !== oldProject.children.length) { throw new Error("Unable To Remove from children of parent project"); }
                        return Promise.all([
                            res.locals.shouldDeletePosts ?
                                deleteManyByID(ModelConstants.POST, res.locals.toBeDeletedPosts) : null,
                            oldProject.save(),
                            deleteByID(ModelConstants.PROJECT, res.locals.project._id),
                            indexUser.save(),
                            completeUser.save(),
                            userPreview.save()
                        ])
                    }

                }))
                .then(() => {
                    return res.status(200).send('Success');
                })
                .catch(next);
        }
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
        PARAM_CONSTANTS.USERNAME,
        PARAM_CONSTANTS.INDEX_USER_ID,
        PARAM_CONSTANTS.USER_ID,
        PARAM_CONSTANTS.SHOULD_COPY_POSTS
    ),
    doesValidationErrorExist,
    (req, res, next) => {
        const oldProjectID = req.body.projectData._id;
        const resolvedProject = findByID(ModelConstants.PROJECT, oldProjectID);
        return resolvedProject.then(
            result => {
                res.locals.oldProject = result;
                next();
            }
        )

    },
    (req, res, next) => {
        let projectData = res.locals.oldProject.toObject();
        const username = req.body.username;
        const authorID = req.body.indexUserID;
        const displayPhoto = req.body.displayPhoto;
        const shouldCopyPosts = req.body.shouldCopyPosts;
        const oldProjectID = projectData._id;
        const ancestors = [...projectData.ancestors];
        const newPostIDList = [];
        const imageKeyMap = new Map();

        let projectPosts = null;
        delete projectData._id;
        delete projectData.username;
        delete projectData.children;
        delete projectData.children_length;
        ancestors.push(oldProjectID);
        let newProject = new (selectModel(ModelConstants.PROJECT))({
            ...projectData,
            index_user_id: authorID,
            display_photo_key: displayPhoto,
            username: username,
            parent: oldProjectID,
            ancestors: ancestors,
            status: 'DRAFT',
            title: projectData.title
        });
        res.locals.title = newProject.title;
        res.locals.id = newProject._id;
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
                    res.locals.oldProject = updateParentProject(res.locals.oldProject, newProject._id);
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
            res.locals.oldProject = updateParentProject(res.locals.oldProject, newProject._id);
            next();
        }
    },
    (req, res, next) => {
        const oldProject = res.locals.oldProject;
        const project = res.locals.project;
        const promisedUserInfo = findByID(ModelConstants.USER, req.body.userID);
        const promisedIndexUser = findByID(ModelConstants.INDEX_USER, req.body.indexUserID)
        return Promise.all([promisedUserInfo, promisedIndexUser])
            .then(results => {
                const user = results[0];
                const indexUser = results[1];
                user.pursuits[0].projects.unshift(
                    selectModel(ModelConstants.CONTENT_PREVIEW)(
                        {
                            content_id: project._id,
                            date: new Date().toISOString().substr(0, 10),
                            labels: project.labels,
                        }));
                for (let i = 1; i < user.pursuits.length; i++) {
                    if (user.pursuits[i].name === project.pursuit) {
                        user.pursuits[i].projects.unshift(
                            selectModel(ModelConstants.CONTENT_PREVIEW)
                                (
                                    {
                                        content_id: project._id,
                                        date: new Date().toISOString().substr(0, 10),
                                        labels: project.labels,
                                    })
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

router.route('/bookmark')
    .put(
        buildBodyValidationChain(
            PARAM_CONSTANTS.BOOKMARK_STATE,
            PARAM_CONSTANTS.PROJECT_ID,
            PARAM_CONSTANTS.USER_PREVIEW_ID,
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const projectID = req.body.projectID;
            const userPreviewID = req.body.userPreviewID;
            const bookmarkState = req.body.bookmarkState;
            if (bookmarkState)
                return findByID(ModelConstants.PROJECT, projectID)
                    .then(result => {
                        if (!result) throw new Error("No Content");
                        result.bookmarks.push(userPreviewID);
                        const newBookmark = (selectModel(ModelConstants.BOOKMARK)
                            ({
                                user_preview_id: userPreviewID,
                                project_id: projectID,
                            }));
                        console.log(newBookmark);
                        return Promise.all([
                            result.save(),
                            newBookmark.save()
                        ])
                    })
                    .then(results => res.status(201).send())
                    .catch(next);
            else {
                return findByID(ModelConstants.PROJECT, projectID)
                    .then(result => {
                        if (!result) throw new Error("No Content");
                        result.bookmarks = result.bookmarks.filter(item => item.toString() !== userPreviewID);
                        console.log(result.bookmarks);
                        return Promise.all([
                            result.save(),
                            deleteOne(ModelConstants.BOOKMARK,
                                { project_id: projectID, user_preview_id: userPreviewID })
                        ])
                    })
                    .then(results => res.status(201).send())
                    .catch(next)
            }
        }
    );


module.exports = router;

