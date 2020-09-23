const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require("./post.model");
const IndexPursuit = require("./index.pursuit.model");

const friendSchema = new Schema({
    friend_profile_id: {
        type: mongoose.Types.ObjectId
    },
    status: {
        type: String
    }
});

const indexUserSchema = new Schema(
    {
        username: {
            type: String,
            index: true,
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
        friend_list: {
            type: mongoose.Types.ObjectId,
        },
        pursuits: [IndexPursuit.Schema],
        activity_feed: [Post.Schema]
    }
);

const indexUserModel = mongoose.model('indexUser', indexUserSchema);

module.exports = {
    Schema: indexUserSchema,
    Model: indexUserModel
};