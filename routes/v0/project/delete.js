const { findByID, findManyByID } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');


const getImageKeys = (req, res, next) => {
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
};

const callMulter = (req, res, next) => {
    const imagesExist = res.locals.toBeDeletedImages.length > 0;
    if (res.locals.shouldDeletePosts && imagesExist) {
        return imageServices.deleteMultiple(res.locals.toBeDeletedImages)
            .then(next)
            .catch(next);
    }
    return next();
}

const updateIndexes = (req, res, next) => {
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
        const last = res.locals.project.ancestors.length - 1;
        promisedDeletionProcess = Promise.all([
            findAndUpdateIndexUserMeta(indexUserID, res.locals.pursuit, SUBTRACT),
            findByID(ModelConstants.USER, userID),
            findByID(ModelConstants.USER_PREVIEW, userPreviewID),
            findByID(ModelConstants.PROJECT, res.locals.project.ancestors[last])
        ])
    }

    return promisedDeletionProcess
        .then((results => {
            const indexUser = results[0];
            const completeUser = results[1];
            const userPreview = results[2];

            _removeProject(indexUser.drafts, req, query.projectID);

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
                    || oldProject.children_length !== oldProject.children.length) {
                    throw new Error("Unable To Remove from children of parent project");
                }
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
};

exports.getImageKeys = getImageKeys;
exports.callMulter = callMulter;
exports.updateIndexes = updateIndexes;