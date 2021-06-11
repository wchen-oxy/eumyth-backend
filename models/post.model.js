const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({

  title: {
    type: String,
    required: false,
    trim: true
  },

  author_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },

  date: {
    type: Date
  },

  difficulty: {
    type: Number,
    required: false,
  },

  subtitle: {
    type: String,
    required: false,
    trim: true
  },

  post_privacy_type: {
    type: String,
    required: false,
  },

  username: {
    type: String,
    required: false,
  },

  display_photo_key: {
    type: String,
    required: false,
  },

  cover_photo_key: {
    type: String,
    required: false,
  },

  progression: {
    type: String,
    required: false,
    trim: true
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

  is_paginated: {
    type: Boolean,
    required: false
  },

  text_snippet: {
    type: String,
    required: false
  },

  text_data: {
    type: String,
    required: false
  },

  image_data: {
    type: [String],
    required: false,
  },

  min_duration: {
    type: Number,
    required: false
  },

  comments: {
    type: [mongoose.Types.ObjectId],
    default: []
  },

  labels: {
    type: [String]
  },

  branch: {
    type: mongoose.Types.ObjectId
  }


}, {
  timestamps: true,
});

const PostModel = mongoose.model('post', PostSchema);

module.exports = {
  Schema: PostSchema,
  Model: PostModel
};