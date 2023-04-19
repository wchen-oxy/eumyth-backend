const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const IndexPursuit = require("./index.pursuit.model");
const IndexRecent = require("./index.recent.model");
const DraftPreview = require("./draft.preview.model");

const IndexUserSchema = new Schema({
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

    cached_feed_id: {
        type: mongoose.Types.ObjectId,
        required: true,
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

    preferred_post_privacy: {
        type: String,
        required: false,
    },

    drafts: {
        type: [DraftPreview.Schema]
    },

    user_relation_id: {
        type: mongoose.Types.ObjectId,
    },

    notifications: {
        type: [String],
    },

    labels: {
        type: [String], //limit 20?
    },
    pursuits: [IndexPursuit.Schema],
    feed_id: mongoose.Types.ObjectId,
    following_feed: [mongoose.Types.ObjectId], //feed from others
    recent_posts: {
        type: [IndexRecent.Schema],
        default: []
    }, // 4 most recent posts
}
);

const IndexUserModel = mongoose.model('index_user', IndexUserSchema);

module.exports = {
    Schema: IndexUserSchema,
    Model: IndexUserModel
};