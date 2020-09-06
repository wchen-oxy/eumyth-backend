const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require("./post.model");
const IndexPursuit = require("./index.pursuit.model");

const indexUserSchema = new Schema(
    {
        username: {
            type: String,
            index: true,
            required: true,
            unique: true,
            trim: true

        },

        user_profile_ref: {
            type: mongoose.Types.ObjectId,
            required: true,
            unique: true,
            trim: true
        },

        preferred_post_type: {
            type: String,
            required: false,
        },
        draft: Post.Schema,
        pursuits: [IndexPursuit.Schema],
        recent_posts: [Post.Schema]
    }
);

const indexUserModel = mongoose.model('indexUser', indexUserSchema);

module.exports = {
    Schema: indexUserSchema,
    Model: indexUserModel
};