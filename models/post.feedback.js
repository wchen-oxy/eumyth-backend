const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = new Schema({
    commenter_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    comment: {
        type: String,
        required: true
    }
});

const liker = new Schema({
    user : mongoose.Types.ObjectId,
    active : Boolean
})

const postFeedbackSchema = new Schema({
    parent_post_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    like_counter: {
        type: Number,
        required: true
    },
    likes: {
        type: [liker],
        required: false,
    },

    comments: [comment],
},
    { timestamps: true }
);

const postFeedbackModel = mongoose.model('postFeedback', postFeedbackSchema);


module.exports = {
    Schema: postFeedbackSchema,
    Model: postFeedbackModel
};