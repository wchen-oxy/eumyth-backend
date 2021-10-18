const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Comment = require('../../models/comment.model');
const ImageAnnotation = require('../../models/image.annotation.model');

const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    buildBodyValidationChain,
    doesValidationErrorExist,
} = require('../../utils/validators/validators');

const {
    retrieveCommentByID,
    findComments,
    retrievePostByID,
    findUserPreviewByIDList,
    retrieveUserPreviewByID
} = require('../../data_access/dal');

const COLLAPSED = "COLLAPSED";
const EXPANDED = "EXPANDED";

const processRootAndTopComments = (rootComments) => {
    let topComment = null;
    let topLikes = 0;
    let commentArray = [];
    let commentUserProfileIDArray = [];
    let transformedRootCommentIDArray = [];
    for (const comment of rootComments) {
        if (comment.likes.length - comment.dislikes.length >
            topLikes && comment.likes !== 0) {
            topComment = comment;
            topLikes = comment.likes.length - comment.dislikes.length;
        }
        commentArray.push(comment);
        commentUserProfileIDArray.push(comment.commenter_user_id.toString());
        transformedRootCommentIDArray.push(mongoose.Types.ObjectId(comment._id))
    }
    return {
        topComment: topComment,
        commentUserProfileIDArray: commentUserProfileIDArray,
        commentArray: commentArray,
        transformedRootCommentIDArray: transformedRootCommentIDArray
    }
}


const nestCompleteComments = (rootCommentArray, userProfileHashTable, repliesArray,) => {
    if (!repliesArray) {
        for (let comment of rootCommentArray) {
            const userData = userProfileHashTable[comment.commenter_user_id.toString()];
            comment.username = userData.username;
            comment.display_photo_key = userData.tiny_cropped_display_photo_key;
            comment.score = comment.likes.length - comment.dislikes.length;
        }
        return rootCommentArray;
    }
    else {
        let nearRootCommentsIndex = 0;
        let allCommentsArray = rootCommentArray.concat(repliesArray);
        allCommentsArray.sort((a, b) => {
            if (a.ancestor_post_ids.length < b.ancestor_post_ids.length) {
                return 1;
            }
            if (a.ancestor_post_ids.length > b.ancestor_post_ids.length) {
                return -1;
            }
            return 0;
        });
        for (let i = 0; i < allCommentsArray.length; i++) {
            let nextValueIndex = i + 1;
            let reply = allCommentsArray[i];
            const userData = userProfileHashTable[reply.commenter_user_id.toString()]
            reply.username = userData.username;
            reply.display_photo_key = userData.tiny_cropped_display_photo_key;
            reply.score = reply.likes.length - reply.dislikes.length;
            if (i > 0 && (allCommentsArray[i - 1].ancestor_post_ids.length
                !== allCommentsArray[i].ancestor_post_ids.length)) {
                nearRootCommentsIndex = i;
            }
            while (
                nextValueIndex < allCommentsArray.length
                && allCommentsArray[i].ancestor_post_ids.length > 0
                && allCommentsArray[i]
                    .ancestor_post_ids[allCommentsArray[i]
                        .ancestor_post_ids.length - 1]
                    .toString()
                !== allCommentsArray[nextValueIndex]._id.toString()) {
                nextValueIndex++;
            }
            if (allCommentsArray[i].ancestor_post_ids.length > 0 &&
                nextValueIndex < allCommentsArray.length
                && allCommentsArray[i]
                    .ancestor_post_ids[allCommentsArray[i]
                        .ancestor_post_ids.length - 1]
                    .toString() === allCommentsArray[nextValueIndex]._id.toString()) {
                if (!allCommentsArray[nextValueIndex].replies) {
                    allCommentsArray[nextValueIndex].replies = [];
                }
                allCommentsArray[nextValueIndex].replies.push(reply);
            }
            else {
                console.log("Orphaned/Root Comment: ", reply);
            }
        }
        return (allCommentsArray
            .slice(
                nearRootCommentsIndex,
                allCommentsArray.length));
    }
}

const returnCollapsedComments = (rootCommentIDArray) => {
    let commentArray = null;
    return findComments(rootCommentIDArray)
        .then((rawComments) => {
            const processedRootComments = processRootAndTopComments(rawComments);
            let slicedCommentIDArray = [];
            commentArray = processedRootComments.commentArray;
            topComment = processedRootComments.topComment;

            for (const comment of commentArray.slice(0, 4)) {
                slicedCommentIDArray.push(comment.commenter_user_id.toString());
            }

            return findUserPreviewByIDList(slicedCommentIDArray);
        })
        .then((results) => {
            let userProfileHashTable = {}

            results.forEach((value) => (
                userProfileHashTable[value._id.toString()] = value));

            return nestCompleteComments(
                commentArray,
                userProfileHashTable,
                null
            );
        });

};

const returnExpandedComments = (rootCommentIDArray) => {
    let rootCommentArray = null;
    let commentUserProfileIDArray = null;
    let transformedRootCommentIDArray = null;
    let replies = null;

    return findComments(rootCommentIDArray)
        .then(
            (rawComments) => {
                const processedRootComments =
                    processRootAndTopComments(rawComments);
                commentUserProfileIDArray =
                    processedRootComments.commentUserProfileIDArray;
                rootCommentArray = processedRootComments.commentArray;
                topComment = processedRootComments.topComment;
                transformedRootCommentIDArray =
                    processedRootComments.transformedRootCommentIDArray;

                return Comment.Model
                    .aggregate([
                        {
                            $match: {
                                "ancestor_post_ids": { $in: transformedRootCommentIDArray },
                            }
                        },
                        {
                            $group: {
                                "_id": "$_id",
                                "parent_post_id": { $first: "$parent_post_id" },
                                "commenter_user_id": { $first: "$commenter_user_id" },
                                "ancestor_post_ids": { $first: "$ancestor_post_ids" },
                                "comment": { $first: "$comment" },
                                "annotation": { $first: "$annotation" },
                                "likes": { $first: "$likes" },
                                "dislikes": { $first: "$dislikes" },
                                "createdAt": { $first: "$createdAt" }
                            }
                        }
                    ]);
            })
        .then((results) => {
            replies = results;
            if (replies.length > 0) {
                let replyingUserProfileIDArray = [];
                for (const reply of replies) {
                    replyingUserProfileIDArray.push(reply.commenter_user_id.toString());
                }
                commentUserProfileIDArray.concat(replyingUserProfileIDArray);
                commentUserProfileIDArray = [... new Set(commentUserProfileIDArray)];
            }
            return findUserPreviewByIDList(commentUserProfileIDArray)
        })
        .then((results) => {
            let userProfileHashTable = {}
            results.forEach(
                (value) => userProfileHashTable[value._id.toString()] = value
            )
            return nestCompleteComments(
                rootCommentArray,
                userProfileHashTable,
                replies.length === 0 ? null : replies
            );
        });
}

const removeVote = (array, voteID) => {
    let index = array.indexOf(voteID);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

router.route('/')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.ROOT_COMMENT_ID_ARRAY,
            PARAM_CONSTANTS.VIEWING_MODE
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const rootCommentIDArray = JSON.parse(req.query.rootCommentIDArray);
            const viewingMode = req.query.viewingMode;
            if (viewingMode === COLLAPSED) {
                return returnCollapsedComments(rootCommentIDArray)
                    .then((result) => res.status(200).send(result))
                    .catch(next);
            }
            else if (viewingMode === EXPANDED) {
                return returnExpandedComments(rootCommentIDArray)
                    .then((results) => {
                        console.log(results);
                        return res.status(200).json({
                            rootComments: results
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).json({ error: error })
                    });
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
            const newReply = new Comment.Model({
                parent_post_id: postID,
                ancestor_post_ids: ancestors,
                commenter_user_id: commenterID,
                comment: comment
            });

            return newReply
                .save()
                .then(() => res.status(200).send())
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
            const resolvedPost = retrievePostByID(postID);
            const resolvedUser = retrieveUserPreviewByID(commenterID);
            let newRootCommentJSON = null;
            let rootCommentArray = null;

            return Promise.all([resolvedPost, resolvedUser])
                .then((result) => {
                    if (!result[0] || !result[1]) throw new Error(204);

                    const annotationPayload = annotationData
                        ? new ImageAnnotation.Model({
                            image_page_number: imagePageNumber,
                            data: annotationData,
                            geometry: annotationGeometry
                        })
                        : null;

                    const commentData = {
                        parent_post_id: postID,
                        ancestor_post_ids: [],
                        commenter_user_id: result[1]._id,
                        comment: comment,
                        annotation: annotationPayload
                    }
                    const newRootComment = new Comment.Model(commentData)
                    console.log(result[1].tiny_cropped_display_photo_key);
                    newRootCommentJSON = {
                        ...commentData,
                        _id: newRootComment._id,
                        display_photo_key: result[1].tiny_cropped_display_photo_key,
                        likes: [],
                        dislikes: [],
                        score: 0
                    }
                    result[0].comments.unshift(newRootComment._id);
                    rootCommentArray = result[0].comments;

                    return Promise.all([result[0].save(), newRootComment.save()]);
                })
                .then(() => {
                    console.log(newRootCommentJSON);
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
            return returnExpandedComments(rootCommentIDArray)
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
                retrieveUserPreviewByID(visitorProfilePreviewID),
                retrieveCommentByID(commentID)
            ])
                .then((results) => {
                    if (!results[0] || !results[1]) throw new Error(204);

                    switch (voteValue) {
                        case (-1):
                            results[1].dislikes.push(results[0]._id);
                            results[1].likes = removeVote(results[1].likes, visitorProfilePreviewID);
                            break;
                        case (1):
                            results[1].likes.push(results[0]._id);
                            results[1].dislikes = removeVote(results[1].dislikes, visitorProfilePreviewID);
                            break;
                        case (-2):
                            results[1].dislikes = removeVote(results[1].dislikes, visitorProfilePreviewID);
                            break;
                        case (2):
                            results[1].likes = removeVote(results[1].likes, visitorProfilePreviewID);
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
