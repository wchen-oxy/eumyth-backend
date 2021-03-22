const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const IndexPursuit = require("./index.pursuit.model");
const Draft = require("./draft.model");

const IndexUserSchema = new Schema(
    {
        username: {
            type: String,
            index: true,
            required: true,
            unique: true,
            trim: true
        },

        bio: {
            type: String,
            trim: true,
            default: ""
        },

        private: {
            type: Boolean,
            required: true,
        },

        cropped_display_photo_key: {
            type: String,
            required: false
        },

        small_cropped_display_photo_key: {
            type: String,
            required: false
        },

        tiny_cropped_display_photo_key: {
            type: String,
            required: false
        },

        user_profile_id: {
            type: mongoose.Types.ObjectId,
            required: true,
            unique: true,
            trim: true
        },

        user_preview_id: {
            type: mongoose.Types.ObjectId,
            required: true,
            unique: true,
            trim: true
        },

        followers: {
            type: Number
        },

        following: {
            type: Number
        },

        preferred_post_type: {
            type: String,
            required: false,
        },

        draft: {
            type: Draft.Schema,
            required: false,
        },

        user_relation_id: {
            type: mongoose.Types.ObjectId,
        },

        notifications: {
            type: [String],
        },
        pursuits: [IndexPursuit.Schema],
        following_feed: [mongoose.Types.ObjectId], //feed from others
        recent_posts: [mongoose.Types.ObjectId] // 4 most recent posts
    }
);

const IndexUserModel = mongoose.model('index_user', IndexUserSchema);

module.exports = {
    Schema: IndexUserSchema,
    Model: IndexUserModel
};