const express = require('express');
const router = express.Router();
const Comment = require("../../models/comment.model");
const ImageAnnotation = require('../../models/image.annotation.model');
const Post = require("../../models/post.model");
const UserPreview = require('../../models/user.preview.model');

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
    for (const comment of rootComments) {
        if (comment.likes.length - comment.dislikes.length >
            topLikes && comment.likes !== 0) {
            topComment = comment;
            topLikes = comment.likes.length - comment.dislikes.length;
        }
        commentArray.push(comment);
        commentUserProfileIdArray.push(comment.commenter_user_id);
    }
    return {
        topComment: topComment,
        commentUserProfileIdArray: commentUserProfileIdArray,
        commentArray: commentArray
    }
}


const returnCollapsedComments = (rootCommentIdArray) => {
    let topComment = null;
    return returnComments(rootCommentIdArray)
        .then((rawComments) => {
            const processedRootComments = processRootAndTopComments(rawComments);
            const commentArray = processedRootComments.commentArray;
            topComment = processedRootComments.topComment;
            if (commentArray.length < 3) {
                return commentArray;
            }
            else {
                return commentArray.slice(0, 4);
            }
        })
        .then(
            (result) => res.status(200).json({ comments: result, topComment: topComment })
        )
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
};

const returnExpandedComments = (rootCommentIdArray) => {
    console.log(rootCommentIdArray);

    let topComment = null;
    let rootCommentArray = null;
    let commentUserProfileIdArray = null;

    return returnComments(rootCommentIdArray)
        .then(
            (rawComments) => {
                const processedRootComments = processRootAndTopComments(rawComments);
                commentUserProfileIdArray = processedRootComments.commentUserProfileIdArray;
                rootCommentArray = processedRootComments.commentArray;
                topComment = processedRootComments.topComment;
                //get all the comments that have the root comment id inside of it
                return Comment.Model
                    .aggregate([
                        {
                            $unwind: '$ancestor_post_ids',
                        },
                        {
                            $match: {
                                "ancestor_post_ids": { $in: rootCommentIdArray },
                                //exclude root posts from ancestor post ids
                                $and: [{ "ancestor_post_ids.3": { "$exists": false } }]
                            }
                        },
                        // {
                        //     $group: {
                        //         _id: '$_id',
                        //     }
                        // }
                    ])
                    //begin insertion of userdata
                    .then((replies) => {
                        if (replies.length > 0) {
                            let replyUserProfileIdArray = [];
                            for (const reply of replies) {
                                replyUserProfileIdArray.push(reply.commenter_user_id);
                            }

                            return Promise.all([
                                UserPreview.Model.find({
                                    '_id': { $in: commentUserProfileIdArray }, function(err, docs) {
                                        if (err) console.log(err);
                                        else {
                                            console.log(docs);
                                        }
                                    }
                                }),
                                UserPreview.Model.find({
                                    '_id': { $in: replyUserProfileIdArray }, function(err, docs) {
                                        if (err) console.log(err);
                                        else {
                                            console.log(docs);
                                        }
                                    }
                                })
                            ])
                                .then(
                                    (results) => {
                                        const combinedUserProfileInfoArray = results[0].concat(results[1]);
                                        return nestCompleteComments(
                                            rootCommentArray,
                                            combinedUserProfileInfoArray,
                                            replies);
                                    }
                                )
                        }
                        else {
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
                                        console.log("no replies");
                                        return nestCompleteComments(
                                            rootCommentArray,
                                            results,
                                            null);
                                    }
                                );
                        }
                    });
            });

}

const nestCompleteComments = (rootCommentArray, userProfileDataArray, repliesArray) => {

    if (!repliesArray) {
        for (let comment of rootCommentArray) {
            const userData = userProfileDataArray.find(
                (item) => item._id.toString() === comment.commenter_user_id.toString()
            );
            comment.username = userData.username;
            comment.display_photo_key = userData.tiny_cropped_display_photo_key;
        }
        return rootCommentArray;

    }
    else {

    }
}



router.route('/')
    .get((req, res) => {
        const rootCommentIdArray = JSON.parse(req.query.rootCommentIdArray);
        const viewingMode = req.query.viewingMode;
        if (viewingMode === COLLAPSED) {
            return returnCollapsedComments(rootCommentIdArray)
                .then((ancestorRoots) => {
                    res.status(200).send(ancestorRoots);
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
                newReply.ancestor_post_ids.push(newReply._id);
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




module.exports = router;
