const express = require('express');
const router = express.Router();
const selectModel = require('../../../models/modelServices');
const commentUtil = require('./services');
const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    buildBodyValidationChain,
    doesValidationErrorExist,
} = require('../../../shared/validators/validators');

const {
    findByID
} = require('../../../data-access/dal');

const COLLAPSED = "COLLAPSED";
const EXPANDED = "EXPANDED";
const ModelConstants = require('../../../models/constants');


router.route('/')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.ROOT_COMMENT_ID_ARRAY,
            PARAM_CONSTANTS.VIEWING_MODE
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const rootCommentIDArray = req.query.rootCommentIDArray;
            const viewingMode = req.query.viewingMode;
            console.log(rootCommentIDArray);
            if (viewingMode === COLLAPSED) {
                return commentUtil.returnCollapsedComments(rootCommentIDArray)
                    .then(
                        (result) => res.status(200).send(result)
                    )
                    .catch(next);
            }
            else if (viewingMode === EXPANDED) {
                return commentUtil.returnExpandedComments(rootCommentIDArray)
                    .then((results) => {
                        return res.status(200).json({
                            rootComments: results
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).json({ error: error })
                    }); hb
            }
            else {
                return (error) => res.status(500).json({ error: error });
            }
        });

router.route('/reply')
    .post(
        buildBodyValidationChain(
            PARAM_CONSTANTS.POST_ID,
            PARAM_CONSTANTS.PROFILE_PREVIEW_ID,
            PARAM_CONSTANTS.ANCESTORS,
            PARAM_CONSTANTS.COMMENT
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const postID = req.body.postID;
            const commenterID = req.body.profilePreviewID;
            const ancestors = JSON.parse(req.body.ancestors);
            const comment = req.body.comment;
            const attributes =
            {
                parent_post_id: postID,
                ancestor_post_ids: ancestors,
                commenter_user_id: commenterID,
                comment: comment
            };
            const newComment = selectModel(ModelConstants.COMMENT)(attributes);

            return newComment
                .save()
                .then(() => res.status(200).send(newComment))
                .catch(next);
        })

router.route('/root')
    .post(
        buildBodyValidationChain(
            PARAM_CONSTANTS.POST_ID,
            PARAM_CONSTANTS.PROFILE_PREVIEW_ID,
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const postID = req.body.postID;
            const commenterID = req.body.profilePreviewID;
            const comment = req.body.comment;
            const annotationData = req.body.annotationData;
            const annotationGeometry = req.body.annotationGeometry;
            const imagePageNumber = req.body.imagePageNumber;
            const resolvedPost = findByID(ModelConstants.POST, postID);
            const resolvedUser = findByID(ModelConstants.USER_PREVIEW, commenterID);
            let newRootCommentJSON = null;
            let rootCommentArray = null;
            return Promise.all([resolvedPost, resolvedUser])
                .then((result) => {
                    if (!result[0] || !result[1]) throw new Error(204);
                    const annotationPayload = annotationData
                        ? selectModel(ModelConstants.IMAGE_ANNOTATION)
                            ({
                                image_page_number: imagePageNumber,
                                data: annotationData,
                                geometry: annotationGeometry
                            })
                        : null;

                    const newRootComment =
                        selectModel(ModelConstants.COMMENT)
                            ({
                                parent_post_id: postID,
                                ancestor_post_ids: [],
                                commenter_user_id: result[1]._id,
                                comment: comment,
                                annotation: annotationPayload
                            });

                    newRootCommentJSON = {
                        ...newRootComment,
                        _id: newRootComment._id,
                        display_photo_key: result[1].tiny_cropped_display_photo_key,
                        likes: [],
                        dislikes: [],
                        score: 0
                    }
                    result[0].comments.unshift(newRootComment._id);
                    rootCommentArray = result[0].comments;
                    return Promise.all([
                        result[0].save(),
                        newRootComment.save()
                    ]);
                })
                .then(() => {
                    return res.status(200).json({
                        rootCommentIDArray: rootCommentArray,
                        newRootComment: newRootCommentJSON
                    });
                })
                .catch(next);
        });

router.route('/refresh')
    .get(
        buildQueryValidationChain(PARAM_CONSTANTS.ROOT_COMMENT_ID_ARRAY),
        doesValidationErrorExist,
        (req, res, next) => {
            const rootCommentIDArray = JSON.parse(req.query.rootCommentIDArray);
            return commentUtil.returnExpandedComments(rootCommentIDArray)
                .then((results) => {
                    return res.status(200).json({ rootComments: results });
                })
                .catch(next)
        })


router.route('/vote')
    .put(
        buildBodyValidationChain(
            PARAM_CONSTANTS.COMMENT_ID,
            PARAM_CONSTANTS.VOTE_VALUE,
            PARAM_CONSTANTS.PROFILE_PREVIEW_ID,
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const commentID = req.body.commentID;
            const voteValue = req.body.voteValue;
            const visitorProfilePreviewID = req.body.profilePreviewID;
            return Promise.all([
                findByID(ModelConstants.USER_PREVIEW, visitorProfilePreviewID),
                findByID(ModelConstants.COMMENT, commentID)
            ])
                .then((results) => {
                    if (!results[0] || !results[1]) throw new Error(204);

                    switch (voteValue) {
                        case (-1):
                            results[1].dislikes.push(results[0]._id);
                            results[1].likes = commentUtil.removeVote(results[1].likes, visitorProfilePreviewID);
                            break;
                        case (1):
                            results[1].likes.push(results[0]._id);
                            results[1].dislikes = commentUtil.removeVote(results[1].dislikes, visitorProfilePreviewID);
                            break;
                        case (-2):
                            results[1].dislikes = commentUtil.removeVote(results[1].dislikes, visitorProfilePreviewID);
                            break;
                        case (2):
                            results[1].likes = commentUtil.removeVote(results[1].likes, visitorProfilePreviewID);
                            break;
                        default:
                            console.log("Nothing matched?");
                            throw new Error("Nothing matched for vote value");
                    }

                    return results[1].save();
                })
                .then(() => res.status(200).send("Success!"))
                .catch(next)
        })

module.exports = router;
