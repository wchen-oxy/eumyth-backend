const ImageAnnotation = require("./image.annotation.model");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({

    parent_post_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    commenter_user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    ancestor_post_ids: {
        type: [mongoose.Types.ObjectId]
    },

    comment: {
        type: String,
    },

    annotation: {
        type: ImageAnnotation.Schema
    },

    likes: {
        type: [mongoose.Types.ObjectId],
        required: false,
    },

    dislikes: {
        type: [mongoose.Types.ObjectId,]
    }

},
    { timestamps: true }
);



const CommentModel = mongoose.model('comment', CommentSchema);


module.exports = {
    Schema: CommentSchema,
    Model: CommentModel
};