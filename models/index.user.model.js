const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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

        private: {
            type: Boolean,
            required: true,
        },

        followers: {
            type: Number
        },

        following: {
            type: Number
        },

        cropped_display_photo: {
            type: String,
            required: false
        },

        small_cropped_display_photo: {
            type: String,
            required: false
        },

        tiny_cropped_display_photo: {
            type: String,
            required: false
        },

        user_profile_id: {
            type: mongoose.Types.ObjectId,
            required: true,
            unique: true,
            trim: true
        },

        preferred_post_type: {
            type: String,
            required: false,
        },

        draft: {
            type: String,
            required: false,
        },

        user_relation_id: {
            type: mongoose.Types.ObjectId,
        },

        pursuits: [IndexPursuit.Schema],
        following_feed: [mongoose.Types.ObjectId], //feed from others
        recent_posts: [mongoose.Types.ObjectId] // 4 most recent posts
    }
);

const indexUserModel = mongoose.model('index_user', indexUserSchema);

module.exports = {
    Schema: indexUserSchema,
    Model: indexUserModel
};