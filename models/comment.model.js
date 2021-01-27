const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ImageAnnotation = require("./image.annotation.model");

const user = new Schema({
    user_id: mongoose.Types.ObjectId,
})

const commentSchema = new Schema({

    parent_post_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    parent_comment_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    ancestor_post_ids: {
        type: [mongoose.Types.ObjectId]
    },

    commenter_user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    comment: {
        type: String,
    },

    annotation: {
        type: ImageAnnotation.Schema
    },

    likes: {
        type: [user],
        required: false,
    },

    dislikes: {
        type: [user]
    }

},
    { timestamps: true }
);

 

const commentModel = mongoose.model('comment', commentSchema);


module.exports = {
    Schema: commentSchema,
    Model: commentModel
};