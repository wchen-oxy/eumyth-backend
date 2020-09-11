const mongoose = require('mongoose');
const Pursuits = require('./pursuit.model');
const Post = require('./post.model');
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
  pinned: [Post.Schema],
  pursuits: [Pursuits.Schema],
  posts: [mongoose.Types.ObjectId],
  recent_posts: [Post.Schema],


}, {
  timestamps: true,
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
  Schema: userSchema,
  Model: userModel
};