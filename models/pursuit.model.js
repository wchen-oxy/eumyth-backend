const ContentPreview = require('./content.preview.model');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PursuitSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true

  },

  display_photo_key: {
    type: String,
    required: false,
  },

  private: {
    type: Boolean,
    required: true,
  },

  experience_level: {
    type: String,
    required: false,
    trim: true
  },

  total_min: {
    type: Number,
    required: false,
  },

  num_posts: {
    type: Number,
    required: false
  },

  posts: {
    type: [ContentPreview.Schema] // limit 20
  },

  projects: {
    type: [ContentPreview.Schema]
  },

});

const PursuitModel = mongoose.model('pursuit', PursuitSchema);

module.exports = {
  Schema: PursuitSchema,
  Model: PursuitModel
};