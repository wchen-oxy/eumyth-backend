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

  bio: {
    type: String,
    trim: true
  },
  private: {
    type: Boolean,
    required: true,
  },
  pinned: [Post.Schema],
  pursuits:[Pursuits.Schema],
  recent_posts: [Post.Schema],
  draft: Post.Schema

}, {
  timestamps: true,
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
  Schema : userSchema,
  Model : userModel
};