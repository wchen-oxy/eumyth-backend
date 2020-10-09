const mongoose = require('mongoose');
const Pursuits = require('./pursuit.model');
const Post = require('./post.model');
const userPreview = require('./user.preview.model');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
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

  cover_photo: {
    type: String,
  },

  bio: {
    type: String,
    trim: true
  },

  private: {
    type: Boolean,
    required: true,
  },
  
  index_user_id: {
    type: mongoose.Types.ObjectId,
  },

  user_relation_id: {
    type: mongoose.Types.ObjectId,
  },

  requests: [userPreview.Schema],
  pinned: [Post.Schema],
  pursuits: [Pursuits.Schema],
  all_posts: [mongoose.Types.ObjectId],
  recent_posts: [Post.Schema],
}, {
  timestamps: true,
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
  Schema: userSchema,
  Model: userModel
};