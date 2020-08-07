const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    author_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    text: String,
    likes: [String]
},
    { timestamps: true }
);

const commentModel = mongoose.model('comment', commentSchema);


module.exports = {
    Schema: commentSchema,
    Model: commentModel
};