const mongoose = require('mongoose');
const Comment = require("./comment.model");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  previewTitle: {
    type: String,
    required: false,
    trim: true
  },

  private: {
    type: Boolean,
    required: false,
  },

  author_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },

  cover_photo_url: {
    type: String,
    required: false,
  },
  
  pursuit_category: {
    type: String,
    required: false,
    trim: true
  },

  post_format: {
    type: String,
    required: true,
  },

  is_milestone: {
    type: Boolean,
    required: false,
  },
  
  text_data: {
    type: String,
    required: false
  },

  image_data: {
    array: [String],
    required:  false,
  },
  
  min_duration: {
    type: Number,
    required: false
  },

  likes: {
    array: [String],
    required:  false,
  },
  recent_comments: [Comment.Schema],
  all_comments: {
    type: mongoose.Types.ObjectId,
  }

}, {
  timestamps: true,
});

const postModel = mongoose.model('post', postSchema);

module.exports = {
  Schema: postSchema,
  Model: postModel
};