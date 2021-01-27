const express = require('express');
const router = express.Router();
const Comment = require("../../models/comment.model");
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
        })
);

const processRootAndTopComments = (rootComments) => {
    let topComment = null;
    let topLikes = 0;
    let commentArray = [];
    for (const comment of rootComments) {
        if (comment.likes.length - comment.dislikes.length >
            topLikes && comment.likes !== 0) {
            topComment = comment;
        }
        else {
            commentArray.push(comment);
        }
    }
    return {
        topComment: topComment,
        commentArray: commentArray
    }
}


const returnCollapsedComments = (commentIdArray) => {
    let topComment = null;
    return returnComments(commentIdArray)
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

const returnExpandedComments = (commentIdArray) => {
    let topComment = null;
    let rootCommentArray = null;

    return returnComments(commentIdArray)
        .then(
            (rawComments) => {
                const processedRootComments = processRootAndTopComments(rawComments);
                rootCommentArray = processedRootComments.commentArray;
                topComment = processedRootComments.topComment;
                //get all the comments that have the root comment id inside of it
                return Comment.Model.aggregate([
                    {
                        $unwind: '$ancestor_post_ids',
                        $match: {
                            $or: {
                                $in: [processedRootComments]
                            }
                        }
                    },

                    {
                        $group: {
                            _id: '$_id',

                        }

                    },


                ]);
            })
        .then((ancestorRoots) => {
            res.status(200).send(ancestorRoots);
        })
}


router.route('/')
    .get((req, res) => {
        const commentIdArray = JSON.parse(req.query.commentIdArray);
        const viewingMode = req.query.viewingMode;
        if (viewingMode === COLLAPSED) {
            return returnCollapsedComments(commentIdArray);
        }
        else if (viewingMode === EXPANDED) {
            return returnExpandedComments(commentIdArray);
        }
        else {
            const error = "No comment viewing modes matched";
            console.log(error)
            return res.status(500).send(error);
        }

    });


router.route('/reply')
    .post((req, res) => {
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

        return UserPreview.Model.findOne({ username: commenter })
            .then((result) => {
                if (!result) throw new Error(204);
                const annotationPayload = dataAnnotationId ?
                    {
                        data_annotation_id: dataAnnotationId,
                        data_annotation_text: dataAnnotationText,
                        geometry_annotation_type: geometryAnnotationType,
                        geometry_x_coordinate: geometryXCoordinate,
                        geometry_y_coordinate: geometryYCoordinate,
                        geometry_width: geometryWidth,
                        geometry_height: geometryHeight
                    } : null;
                const newReply = new Comment.Model({
                    parent_post_id: postId,
                    ancestor_post_ids: ancestors,
                    commenter_user_id: result[1]._id,
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
        const postId = req.body.postId;
        const commenter = req.body.commenterUsername;
        const comment = req.body.comment;
        const dataAnnotationId = req.body.dataAnnotationId;
        const dataAnnotationText = req.body.dataAnnotationText;
        const geometryAnnotationType = req.body.geometryAnnotationType;
        const geometryXCoordinate = req.body.geometryXCoordinate;
        const geometryYCoordinate = req.body.geometryYCoordinate;
        const geometryWidth = req.body.geometryWidth;
        const geometryHeight = req.body.geometryHeight;

        const resolvedPost = Post.Model.findById(postId);
        const resolvedUser = UserPreview.findOne({ username: commenter });
        return Promise.all([resolvedPost, resolvedUser])
            .then(
                (result) => {
                    if (!result[0] || !result[1]) throw new Error(204)
                    const annotationPayload = dataAnnotationId ?
                        {
                            data_annotation_id: dataAnnotationId,
                            data_annotation_text: dataAnnotationText,
                            geometry_annotation_type: geometryAnnotationType,
                            geometry_x_coordinate: geometryXCoordinate,
                            geometry_y_coordinate: geometryYCoordinate,
                            geometry_width: geometryWidth,
                            geometry_height: geometryHeight
                        } : null;
                    const newRootComment = new Comment.Model({
                        parent_post_id: postId,
                        ancestor_post_ids: [],
                        commenter_user_id: result[1]._id,
                        comment: comment,
                        annotation: annotationPayload
                    })
                    result[0].comments.unshift(
                        newRootComment._id
                    );
                    return Promise.all([result[0].save(), newRootComment.save()]);
                }
            )
            .then((res) => {
                res.status(200).send();
            })
            .catch((err) => {
                if (err.status === 204) console.log("No user or original post found");
                console.log(err);
                res.status(500).send();
            });
    });




module.exports = router;
