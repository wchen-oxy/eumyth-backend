const express = require('express');
const router = express.Router();
const Comment = require("../models/comment.model");
const Post = require("../../models/post.model");

router.route('/')
    .post((req, res) => {
        const postId = req.body.postId;
        const commenter = req.body.commenter;
        const comment = req.body.comment;
        const dataAnnotationId = req.body.dataAnnotationId;
        const dataAnnotationText = req.body.dataAnnotationText;
        const geometryAnnotationType = req.body.geometryAnnotationType;
        const geometryXCoordinate = req.body.geometryXCoordinate;
        const geometryYCoordinate = req.body.geometryYCoordinate;
        const geometryWidth = req.body.geometryWidth;
        const geometryHeight = req.body.geometryHeight;
    
    })


module.exports = router;
