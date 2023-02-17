const mongoose = require('mongoose');
const Pursuits = require('./pursuit.model');
const Post = require('./post.model');
const Project = require('./project.model');
const UserPreview = require('./user.preview.model');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
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

  cached_feed_id: {
    type: mongoose.Types.ObjectId,
  },

  index_user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true,
    trim: true
  },

  user_relation_id: {
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

  requests: [UserPreview.Schema],

  pinned_posts: [Post.Schema],

  pinned_projects: [Project.Schema],

  pursuits: [Pursuits.Schema],

  labels: {
    type: [String],
  },
}, {
  timestamps: true,
});

const UserModel = mongoose.model('user', UserSchema);

module.exports = {
  Schema: UserSchema,
  Model: UserModel
};