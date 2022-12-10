const {
    checkStringBoolean,
    verifyArray
} = require('../../../shared/helper');
const ModelConstants = require('../../../models/constants');
const { findByID } = require('../../../data-access/dal');
const postServices = require('./services');
const updatePost = (req, res, next) => {
    const postID = req.body.postID;
    const username = req.body.username;
    const isPaginated = checkStringBoolean(req.body.isPaginated);
    const difficulty = req.body.difficulty ? req.body.difficulty : null;
    const postPrivacyType = req.body.postPrivacyType ? req.body.postPrivacyType : null;
    const labels = req.body.labels ? verifyArray(req.body.labels) : [];
    const indexUserID = req.body.indexUserID ? req.body.indexUserID : null;
    const title = !!req.body.title ? req.body.title : null;
    // const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
    const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
    const date = !!req.body.date ? req.body.date : null;
    const textData = !!req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const projectPreviewID = !!req.body.projectPreviewID ? req.body.projectPreviewID : null;
    const coverPhotoKey = req.file ? req.file.key : null;
    const removeCoverPhoto = checkStringBoolean(req.body.removeCoverPhoto);
    let shouldUpdateLabels = false;
    let completeUserID = null;
    return findByID(ModelConstants.POST, postID)
        .then(
            (result) => {
                let post = result;
                if (postPrivacyType) {
                    post.post_privacy_type = postPrivacyType;
                }
                if (projectPreviewID) {
                    post.project_preview_id = projectPreviewID;
                }
                if (pursuitCategory) {
                    post.pursuit_category = pursuitCategory;
                }

                if (removeCoverPhoto) {
                    post.cover_photo_key = null;
                }
                else if (coverPhotoKey) {
                    post.cover_photo_key = coverPhotoKey;
                }

                shouldUpdateLabels = labels !== post.labels;
                completeUserID = post.author_id;
                post.labels = labels;
                post.difficulty = difficulty;
                post.username = username;
                post.title = title;
                // post.subtitle = subtitle;
                post.date = date;
                post.min_duration = minDuration;
                post.is_paginated = isPaginated;
                post.text_data = textData;
                post.text_snippet = textData ? postServices.makeTextSnippet(isPaginated, textData) : null;
                return post.save()
            })
        .then(() => {
            if (shouldUpdateLabels) {
                return Promise.all([
                    findByID(ModelConstants.USER, completeUserID),
                    findByID(ModelConstants.INDEX_USER, indexUserID)])
                    .then(
                        results => {
                            const completeUser = results[0];
                            const indexUser = results[1];
                            postServices.updateLabels(completeUser, indexUser, labels);
                            return Promise.all([completeUser.save(), indexUser.save()]);
                        }
                    )
                    .then(() => res.status(200).send());
            }
            else
                return res.status(200).send();
        })
        .catch(next)
}

exports.updatePost = updatePost;