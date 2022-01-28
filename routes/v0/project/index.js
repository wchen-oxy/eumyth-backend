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
    deleteByID
} = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const { findAndUpdateIndexUserMeta, partialDelete, updateParentProject } = require('./services');
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
            PARAM_CONSTANTS.SELECTED_POSTS,
            PARAM_CONSTANTS.TITLE
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const username = req.body.username;
            const displayPhoto = req.body.displayPhoto;
            const userID = req.body.userID;
            const indexUserID = req.body.indexUserID;
            const userPreviewID = req.body.userPreviewID;
            const selectedPosts = req.body.selectedPosts ?
                req.body.selectedPosts : [];
            const title = req.body.title ? req.body.title : null;
            const overview = req.body.overview ? req.body.overview : null;
            const pursuit = req.body.pursuit ? req.body.pursuit : null;
            const startDate = req.body.startDate ? req.body.startDate : null;
            const endDate = req.body.endDate ? req.body.endDate : null;
            const status = req.body.status ? req.body.status : null;
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
            const resolvedUserPreview = updatePursuitObject(ModelConstants.USER_PREVIEW, userPreviewID, newProject._id)
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
        MulterHelper.contentImageUpload.single({ name: "coverPhoto", maxCount: 1 }),
        buildBodyValidationChain(
            PARAM_CONSTANTS.PROJECT_ID,
            PARAM_CONSTANTS.TITLE
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const updates = {};
            req.file ? updates.cover_photo_key = req.file.key : null;
            req.body.title ? updates.title = req.body.title : null;
            req.body.overview ? updates.overview = req.body.overview : null;
            req.body.pursuitCategory ? updates.pursuit = req.body.pursuitCategory : null;
            req.body.startDate ? updates.start_date = req.body.startDate : null;
            req.body.endDate ? updates.end_date = req.body.endDate : null;
            req.body.status ? updates.status = req.body.status : null;
            req.body.minDuration ? updates.min_duration = req.body.minDuration : null;
            req.body.selectedPosts ? updates.post_ids = req.body.selectedPosts : null;
            req.body.labels ? updates.labels = req.body.labels : null;
            return findByID(
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
            const indexUserID = req.query.indexUserID;
            const userID = req.query.userID;
            const userPreviewID = req.query.userPreviewID;
            const resolvedDeletion = res.locals.shouldDeletePosts ?
                deleteManyByID(ModelConstants.POST, res.locals.toBeDeletedPosts) : null;
            const oldProject = partialDelete(res.locals.project);
            const _removeProject = (array, ID) => {
                for (let i = 0; i < array.length; i++) {
                    if (array[i].content_id.toString() === ID) {
                        array.splice(i, 1)
                    }
                }
            }

            return Promise.all([
                findAndUpdateIndexUserMeta(indexUserID, res.locals.pursuit, SUBTRACT),
                findByID(ModelConstants.USER, userID),
                findByID(ModelConstants.USER_PREVIEW, userPreviewID)
            ])
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

                    return Promise.all([resolvedDeletion, oldProject.save(), indexUser.save(), completeUser.save(), userPreview.save()])
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
            const quantity = req.params.quantity;
            const pursuitArray = req.params.pursuitArray;
            // return 
            return res.status(200).send();

        }
    )
module.exports = router;

