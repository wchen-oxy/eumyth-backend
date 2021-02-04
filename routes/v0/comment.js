const express = require('express');
const router = express.Router();
const Comment = require("../../models/comment.model");
const ImageAnnotation = require('../../models/image.annotation.model');
const Post = require("../../models/post.model");
const UserPreview = require('../../models/user.preview.model');
const mongoose = require('mongoose');
const COLLAPSED = "COLLAPSED";
const EXPANDED = "EXPANDED";

const returnComments = (commentIdArray) =>
(
    Comment.Model
        .find({
            '_id': { $in: commentIdArray }, function(err, docs) {
                if (err) console.log(err);
                else {
                    console.log(docs);
                }
            }
        }).lean()
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


const returnCollapsedComments = (rootCommentIdArray) => {
    let topComment = null;
    let commentArray = null;

    return returnComments(rootCommentIdArray)
        .then((rawComments) => {
            const processedRootComments = processRootAndTopComments(rawComments);
            commentArray = processedRootComments.commentArray;
            topComment = processedRootComments.topComment;

            let slicedCommentIdArray = [];
            for (const comment of commentArray.slice(0, 4)
            ) {
                slicedCommentIdArray.push(comment.commenter_user_id.toString());
            }

            return UserPreview.Model.find({
                '_id': { $in: slicedCommentIdArray }, function(err, docs) {
                    if (err) console.log(err);
                    else {
                        console.log(docs);
                    }
                }
            })
        })
        .then((results) => {
            let userProfileHashTable = {}
            results.forEach(
                (value) => userProfileHashTable[value._id.toString()] = value
            );
            return nestCompleteComments(
                commentArray,
                userProfileHashTable,
                null
            );
        });

};

const returnExpandedComments = (rootCommentIdArray) => {
    let topComment = null;
    let rootCommentArray = null;
    let commentUserProfileIdArray = null;
    let transformedRootCommentIdArray = null;

    return returnComments(rootCommentIdArray)
        .then(
            (rawComments) => {
                const processedRootComments = processRootAndTopComments(rawComments);
                commentUserProfileIdArray = processedRootComments.commentUserProfileIdArray;
                rootCommentArray = processedRootComments.commentArray;
                topComment = processedRootComments.topComment;
                transformedRootCommentIdArray = processedRootComments.transformedRootCommentIdArray;
                //get all the comments that have the root comment id inside of it
                // console.log(transformedRootCommentIdArray);

                return Comment.Model
                    .aggregate([
                        {
                            $unwind: '$ancestor_post_ids',
                        },
                        {
                            $match: {
                                // _id: mongoose.Types.ObjectId('601728c2b2a30831410d0265'),
                                "ancestor_post_ids": { $in: transformedRootCommentIdArray },
                                //exclude root posts from ancestor post ids
                                $and: [{ "ancestor_post_ids.3": { "$exists": false } }]
                            }
                        },
                        {
                            $group: {
                                "_id": "$_id",
                                "parent_post_id": { $first: "$parent_post_id" },
                                "commenter_user_id": { $first: "$commenter_user_id" },
                                "ancestor_post_ids": { $push: "$ancestor_post_ids" },
                                "comment": { $first: "$comment" },
                                "annotation": { $first: "$annotation" },
                                "likes": { $first: "$likes" },
                                "dislikes": { $first: "$dislikes" },
                                "createdAt": { $first: "$createdAt" }
                            }

                        }

                    ])
                    //begin insertion of userdata
                    .then((replies) => {
                        if (replies.length > 0) {
                            let replyingUserProfileIdArray = [];
                            for (const reply of replies) {
                                replyingUserProfileIdArray.push(reply.commenter_user_id.toString());
                            }
                            commentUserProfileIdArray.concat(replyingUserProfileIdArray);
                            commentUserProfileIdArray = [... new Set(commentUserProfileIdArray)];
                        }

                        return UserPreview.Model.find({
                            '_id': { $in: commentUserProfileIdArray }, function(err, docs) {
                                if (err) console.log(err);
                                else {
                                    console.log(docs);
                                }
                            }
                        })
                            .then(
                                (results) => {
                                    let userProfileHashTable = {}
                                    results.forEach(
                                        (value) => userProfileHashTable[value._id.toString()] = value
                                    )
                                    return nestCompleteComments(
                                        rootCommentArray,
                                        userProfileHashTable,
                                        replies.length === 0 ? null : replies
                                    );
                                }
                            );
                    })

                    ;
            });

}


const nestCompleteComments = (rootCommentArray, userProfileHashTable, repliesArray,) => {

    if (!repliesArray) {
        for (let comment of rootCommentArray) {
            const userData = userProfileHashTable[comment.commenter_user_id.toString()];
            comment.username = userData.username;
            comment.display_photo_key = userData.tiny_cropped_display_photo_key;
        }
        return rootCommentArray;

    }
    else {
        let allCommentsArray = rootCommentArray.concat(repliesArray);
        allCommentsArray.sort((a, b) => {
            // console.log("a", a.ancestor_post_ids.length);
            // console.log(a);
            // console.log("b", b.ancestor_post_ids.length);
            // console.log(b);
            if (a.ancestor_post_ids.length < b.ancestor_post_ids.length) {
                return 1;
            }
            if (a.ancestor_post_ids.length > b.ancestor_post_ids.length) {
                return -1;
            }
            return 0;
        });
        console.log(allCommentsArray);
        let nearRootCommentsIndex = 0;

        for (let i = 0; i < allCommentsArray.length; i++) {
            let nextValueIndex = i + 1;
            let reply = allCommentsArray[i];
            const userData = userProfileHashTable[reply.commenter_user_id.toString()]
            reply.username = userData.username;
            reply.display_photo_key = userData.tiny_cropped_display_photo_key;

            //get the nearRootCommentsIndex for Slicing Later
            if (i > 0 &&
                allCommentsArray[i - 1].ancestor_post_ids.length !== allCommentsArray[i].ancestor_post_ids.length) {
                nearRootCommentsIndex = i;
            }

            //send second pointer out to search for matching value
            console.log(allCommentsArray[i].ancestor_post_ids);

            while (
                nextValueIndex < allCommentsArray.length &&
                allCommentsArray[i].ancestor_post_ids.length > 0 &&
                allCommentsArray[i].ancestor_post_ids[allCommentsArray[i].ancestor_post_ids.length - 1].toString() !==
                allCommentsArray[nextValueIndex]._id.toString()) {
                console.log("index", i);
                nextValueIndex++;
            }
            console.log("index", nextValueIndex)
            if (
                allCommentsArray[i].ancestor_post_ids.length > 0 &&
                nextValueIndex < allCommentsArray.length
                &&
                allCommentsArray[i].ancestor_post_ids[allCommentsArray[i].ancestor_post_ids.length - 1].toString() ===
                allCommentsArray[nextValueIndex]._id.toString()
            ) {
                if (!allCommentsArray[nextValueIndex].replies) {
                    console.log("No Replies array");
                    allCommentsArray[nextValueIndex].replies = [];
                }
                allCommentsArray[nextValueIndex].replies.push(reply)
            }
            else {
                console.log("Orphaned Comment : (");
            }
        }

        let slicedComments = allCommentsArray.slice(nearRootCommentsIndex, allCommentsArray.length);
        console.log("finalCommnets", slicedComments)
        return slicedComments;
    }
}



router.route('/')
    .get((req, res) => {
        const rootCommentIdArray = JSON.parse(req.query.rootCommentIdArray);
        const viewingMode = req.query.viewingMode;
        if (viewingMode === COLLAPSED) {
            return returnCollapsedComments(rootCommentIdArray)
                .then(
                    (result) => res.status(200).send(result)
                )
                .catch((err) => {
                    console.log(err);
                    res.status(500).send(err);
                });

        }
        else if (viewingMode === EXPANDED) {
            return returnExpandedComments(rootCommentIdArray)
                .then((ancestorRoots) => {
                    res.status(200).send(ancestorRoots);
                });
        }
        else {
            const error = "No comment viewing modes matched";
            console.log(error)
            return res.status(500).send(error);
        }


    });


router.route('/reply')
    .post((req, res) => {
        console.log("lbadsf");
        console.log(req.body);

        const postId = req.body.postId;
        const commenter = req.body.commenterUsername;
        const ancestors = JSON.parse(req.body.ancestors);
        const comment = req.body.comment;
        const dataAnnotationId = req.body.dataAnnotationId;
        const dataAnnotationText = req.body.dataAnnotationText;
        const geometryAnnotationType = req.body.geometryAnnotationType;
        const geometryXCoordinate = req.body.geometryXCoordinate;
        const geometryYCoordinate = req.body.geometryYCoordinate;
        const geometryWidth = req.body.geometryWidth;
        const geometryHeight = req.body.geometryHeight;
        const imagePageNumber = req.body.imagePageNumber;

        console.log(req.body);
        return UserPreview.Model.findOne({ username: commenter })
            .then((result) => {
                if (!result) throw new Error(204);
                const annotationPayload = dataAnnotationId ?
                    new ImageAnnotation.Model({
                        data_annotation_id: dataAnnotationId,
                        data_annotation_text: dataAnnotationText,
                        geometry_annotation_type: geometryAnnotationType,
                        geometry_x_coordinate: geometryXCoordinate,
                        geometry_y_coordinate: geometryYCoordinate,
                        geometry_width: geometryWidth,
                        geometry_height: geometryHeight,
                        image_page_number: imagePageNumber
                    })
                    : null;
                const newReply = new Comment.Model({
                    parent_post_id: postId,
                    ancestor_post_ids: ancestors,

                    commenter_user_id: result._id,
                    comment: comment,
                    annotation: annotationPayload
                });
                return newReply.save();
            })
            .then((result) => res.status(200).send())
            .catch((err) => {
                if (err.status === 204) console.log("No parent comment or commenter user profile found");
                console.log(err);
                res.status(500).send();
            });
    })
router.route('/root')
    .post((req, res) => {
        console.log(req.body);
        const postId = req.body.postId;
        const commenter = req.body.commenterUsername;
        const comment = req.body.comment;
        console.log(3);

        const dataAnnotationId = req.body.dataAnnotationId;
        console.log(4);
        const dataAnnotationText = req.body.dataAnnotationText;
        const geometryAnnotationType = req.body.geometryAnnotationType;
        const geometryXCoordinate = req.body.geometryXCoordinate;
        console.log(5);

        const geometryYCoordinate = req.body.geometryYCoordinate;
        const geometryWidth = req.body.geometryWidth;
        const geometryHeight = req.body.geometryHeight;
        console.log(6);

        const imagePageNumber = req.body.imagePageNumber;

        const resolvedPost = Post.Model.findById(postId);
        const resolvedUser = UserPreview.Model.findOne({ username: commenter });
        return Promise.all([resolvedPost, resolvedUser])
            .then(
                (result) => {
                    console.log(3);

                    if (!result[0] || !result[1]) throw new Error(204)
                    const annotationPayload = dataAnnotationId ?
                        new ImageAnnotation.Model({
                            data_annotation_id: dataAnnotationId,
                            data_annotation_text: dataAnnotationText,
                            geometry_annotation_type: geometryAnnotationType,
                            geometry_x_coordinate: geometryXCoordinate,
                            geometry_y_coordinate: geometryYCoordinate,
                            geometry_width: geometryWidth,
                            geometry_height: geometryHeight,
                            image_page_number: imagePageNumber
                        }) : null;
                    const newRootComment = new Comment.Model({
                        parent_post_id: postId,
                        ancestor_post_ids: [],

                        commenter_user_id: result[1]._id,
                        comment: comment,
                        annotation: annotationPayload
                    })
                    console.log(2);
                    result[0].comments.unshift(
                        newRootComment._id
                    );
                    return Promise.all([result[0].save(), newRootComment.save()]);
                }
            )
            .then((result) => {
                res.status(200).send();
            })
            .catch((err) => {
                if (err.status === 204) console.log("No user or original post found");
                console.log(err);
                res.status(500).send();
            });
    });

router.route('/vote').put((req, res) => {
    const commentId = req.body.commentId;
    const commentPoint = req.body.commentPoint;
    const visitorUsername = req.body.visitorUsername;
    return Promise.all([
        UserPreview.Model.findOne({ username: visitorUsername }),
        Comment.Model.findById(commentId)
    ])
        .then((results) => {
            if (!results[0] || !results[1]) throw new Error(204)
            if (commentPoint === -1) {
                results[1].likes.push(results[0]);
            }
            else if (commentPont === 1) {
                results[1].dislikes.push(results[0]);
            }
            return results[1].save();
        })
        .catch((err) => {
            if (err.status === 204) {
                console.log("No user or no comment found");
                return res.status(204).send(err);
            }
            console.log(err);
            return res.status(500).send();
        })

})




module.exports = router;
