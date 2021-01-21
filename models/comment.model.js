const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const liker = new Schema({
    user_id : mongoose.Types.ObjectId,
})

const commentSchema = new Schema({
    parent_user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    parent_post_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    comment: {
        type: String,
    },

    likes: {
        type: [liker],
        required: false,
    },

},
    { timestamps: true }
);

commentSchema.add({
    children: [commentSchema]
})

const commentModel = mongoose.model('comment', commentSchema);


module.exports = {
    Schema: commentSchema,
    Model: commentModel
};