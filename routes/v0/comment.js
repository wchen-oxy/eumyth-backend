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


const returnCollapsedComments = (commentIdArray) => {
    return returnComments(commentIdArray)
        .then((rootComments) => {
            let topComment = null;
            let topLikes = 0;
            let commentArray = [];
            for (const comment of rootComments) {
                if (comment.likes > topLikes && comment.likes !== 0) {
                    topComment = comment;
                }
            }
            if (commentArray.length < 3) {
                return rootComments;
            }
            else {
                return rootComments.slice(rootComments.length - 4, rootComments.length - 1);
            }
        })
        .then(
            (result) => res.status(200).json({ comments: result })
        )
        .catch((err) => {
            console.log(err);
            res.status(500).send(err);
        });
};

const returnExpandedComments = (commentIdArray) => {
    return returnComments(commentIdArray)
        .then(
            (rootComments) => {
                let topComment = null;
                let topLikes = 0;
                let commentArray = [];
                for (const comment of rootComments) {
                    if (comment.likes > topLikes && comment.likes !== 0) {
                        topComment = comment;
                    }
                }
            }
        )

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

                    result[0].comments.push(
                        new Comment.Model({
                            parent_post_id: postId,
                            parent_comment_id: null,
                            ancestor_post_ids: [],
                            commenter_user_id: result[1]._id,
                            comment: comment,
                            annotation: annotationPayload
                        })
                    );
                    return result[0].save();
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
