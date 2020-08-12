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

        private: {
            type: Boolean,
            required: true,
        },

        pursuits: [IndexPursuit.Schema],
        latestPosts: [Post.Schema]
    }
);

const indexUserModel = mongoose.model('indexUser', indexUserSchema);

module.exports = {
    Schema: indexUserSchema,
    Model: indexUserModel
};