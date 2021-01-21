const mongoose = require('mongoose');
const Pursuits = require('./pursuit.model');
const Post = require('./post.model');
const Project = require('./project.model');
const PostPreview = require('./post.preview.model');
const userPreview = require('./user.preview.model');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
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

  cover_photo_key: {
    type: String,
  },

  bio: {
    type: String,
    trim: true
  },
 
  index_user_id: {
    type: mongoose.Types.ObjectId,
  },

  user_relation_id: {
    type: mongoose.Types.ObjectId,
  },

  requests: [userPreview.Schema],

  pinned_posts: [Post.Schema],

  pinned_projects: [Project.Schema],

  pursuits: [Pursuits.Schema],

  all_posts: [mongoose.Types.ObjectId], //all posts including the most recent posts. ID only
  
  dated_posts: {
    type: [PostPreview.Schema]
  },

  undated_posts: {
    type: [mongoose.Types.ObjectId]
  }

}, {
  timestamps: true,
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
  Schema: userSchema,
  Model: userModel
};