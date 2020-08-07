const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Post = require("./post.model");

const indexEventSchema = new Schema({
    name: String,

    experience_level: {
        type: String,
        required: false,
        trim: true
       
      },

    num_posts: {
        type: Number,
        required: false
    },

    num_milestones: {
        type: Number,
        required: false
    },

    total_min: {
        type: Number,
        required:  false,
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

        pursuits: [indexEventSchema],
        latestPosts: [Post.Schema]
    }
);

const indexUserModel = mongoose.model('indexUser', indexUserSchema);

module.exports = {
    Schema: indexUserSchema,
    Model: indexUserModel
};