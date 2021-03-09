const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Comment = require("../../models/comment.model");
const ImageAnnotation = require('../../models/image.annotation.model');
const Post = require("../../models/post.model");
const UserPreview = require('../../models/user.preview.model');
const Helper = require('../../constants/helper');

const COLLAPSED = "COLLAPSED";
const EXPANDED = "EXPANDED";

const returnComments = (commentIdArray) => (
    Comment.Model
        .find({
            '_id': { $in: commentIdArray }
        }, Helper.resultCallback)
        .lean()
);

const processRootAndTopComments = (rootComments) => {
    let topComment = null;
    let topLikes = 0;
    let commentArray = [];
    let commentUserProfileIdArray = [];
    let transformedRootCommentIdArray = [];
    for (const comment of rootComments) {
        if (comment.likes.length - comment.dislikes.length >
            topLikes && comment.likes !== 0) {
            topComment = comment;
            topLikes = comment.likes.length - comment.dislikes.length;
        }
        commentArray.push(comment);
        commentUserProfileIdArray.push(comment.commenter_user_id.toString());
        transformedRootCommentIdArray.push(mongoose.Types.ObjectId(comment._id))
    }
    return {
        topComment: topComment,
        commentUserProfileIdArray: commentUserProfileIdArray,
        commentArray: commentArray,
        transformedRootCommentIdArray: transformedRootCommentIdArray
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

const returnCollapsedComments = (rootCommentIdArray) => {
    let commentArray = null;

    return returnComments(rootCommentIdArray)
        .then((rawComments) => {
            const processedRootComments = processRootAndTopComments(rawComments);
            let slicedCommentIdArray = [];
            commentArray = processedRootComments.commentArray;
            topComment = processedRootComments.topComment;

            for (const comment of commentArray.slice(0, 4)) {
                slicedCommentIdArray.push(comment.commenter_user_id.toString());
            }

            return UserPreview.Model.find({
                '_id': { $in: slicedCommentIdArray }
            },
                Helper.resultCallback)
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

const returnExpandedComments = (rootCommentIdArray) => {
    let rootCommentArray = null;
    let commentUserProfileIdArray = null;
    let transformedRootCommentIdArray = null;
    let replies = null;

    return returnComments(rootCommentIdArray)
        .then(
            (rawComments) => {
                const processedRootComments =
                    processRootAndTopComments(rawComments);
                commentUserProfileIdArray =
                    processedRootComments.commentUserProfileIdArray;
                rootCommentArray = processedRootComments.commentArray;
                topComment = processedRootComments.topComment;
                transformedRootCommentIdArray =
                    processedRootComments.transformedRootCommentIdArray;

                return Comment.Model
                    .aggregate([
                        {
                            $match: {
                                "ancestor_post_ids": { $in: transformedRootCommentIdArray },
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
                let replyingUserProfileIdArray = [];
                for (const reply of replies) {
                    replyingUserProfileIdArray.push(reply.commenter_user_id.toString());
                }
                commentUserProfileIdArray.concat(replyingUserProfileIdArray);
                commentUserProfileIdArray = [... new Set(commentUserProfileIdArray)];
            }
            return UserPreview.Model.find({
                '_id': { $in: commentUserProfileIdArray }
            }, Helper.resultCallback)
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



const removeVote = (array, voteId) => {
    let index = array.indexOf(voteId);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

router.route('/')
    .get((req, res) => {
        const visitorUsername = req.query.visitorUsername;
        const rootCommentIdArray = JSON.parse(req.query.rootCommentIdArray);
        const viewingMode = req.query.viewingMode;
        if (viewingMode === COLLAPSED) {
            return returnCollapsedComments(rootCommentIdArray)
                .then((result) => res.status(200).send(result))
                .catch((error) => {
                    console.log(error);
                    return res.status(500).json({ error: error })
                });
        }
        else if (viewingMode === EXPANDED) {
            return Promise.all([
                UserPreview.Model.findOne({ username: visitorUsername }),
                returnExpandedComments(rootCommentIdArray)
            ])
                .then((results) => {
                    return res.status(200).json({
                        userPreviewId: results[0]._id,
                        rootComments: results[1]
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
    .post((req, res) => {
        const postId = req.body.postId;
        const commenterId = req.body.visitorProfilePreviewId;
        const ancestors = JSON.parse(req.body.ancestors);
        const comment = req.body.comment;
        const newReply = new Comment.Model({
            parent_post_id: postId,
            ancestor_post_ids: ancestors,
            commenter_user_id: commenterId,
            comment: comment
        });

        return newReply
            .save()
            .then(() => res.status(200).send())
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            });
    })

router.route('/root')
    .post((req, res) => {
        const postId = req.body.postId;
        const commenterId = req.body.visitorProfilePreviewId;
        const comment = req.body.comment;
        const annotationData = req.body.annotationData;
        const annotationGeometry = req.body.annotationGeometry;
        const imagePageNumber = req.body.imagePageNumber;
        const resolvedPost = Post.Model.findById(postId);
        const resolvedUser = UserPreview.Model.findById(commenterId);
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
                    parent_post_id: postId,
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
                    rootCommentIdArray: rootCommentArray,
                    newRootComment: newRootCommentJSON
                });
            })
            .catch((error) => {
                if (error.status === 204) console.log("No user or original post found");
                console.log(error);
                return res.status(500).json({ error: error });
            });
    });

router.route('/refresh')
    .get((req, res) => {
        const rootCommentIdArray = JSON.parse(req.query.rootCommentIdArray);
        return returnExpandedComments(rootCommentIdArray)
            .then((results) => {
                return res.status(200).json({ rootComments: results });
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            })
    })


router.route('/vote')
    .put((req, res) => {
        const commentId = req.body.commentId;
        const voteValue = req.body.voteValue;
        const visitorProfilePreviewId = req.body.visitorProfilePreviewId;

        return Promise.all([
            UserPreview.Model.findById(visitorProfilePreviewId),
            Comment.Model.findById(commentId)
        ])
            .then((results) => {
                if (!results[0] || !results[1]) throw new Error(204);

                switch (voteValue) {
                    case (-1):
                        results[1].dislikes.push(results[0]._id);
                        results[1].likes = removeVote(results[1].likes, visitorProfilePreviewId);
                        break;
                    case (1):
                        results[1].likes.push(results[0]._id);
                        results[1].dislikes = removeVote(results[1].dislikes, visitorProfilePreviewId);
                        break;
                    case (-2):
                        results[1].dislikes = removeVote(results[1].dislikes, visitorProfilePreviewId);
                        break;
                    case (2):
                        results[1].likes = removeVote(results[1].likes, visitorProfilePreviewId);
                        break;
                    default:
                        console.log("Nothing matched?");
                        throw new Error("Nothing matched for vote value");
                }

                return results[1].save();
            })
            .then(() => res.status(200).send("Success!"))
            .catch((error) => {
                if (error.status === 204) {
                    console.log("No user or no comment found");
                    return res.status(204).json({ error: error });
                }
                console.log(error);
                return res.status(500).json({ error: error });
            })
    })

module.exports = router;
