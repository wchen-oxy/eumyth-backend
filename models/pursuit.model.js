const ContentPreview = require('./content.preview.model');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PursuitSchema = new Schema({
  name: {
    type: String,
    required: false,
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

  num_milestones: {
    type: Number,
    required: false
  },

  posts: {
    type: [ContentPreview.Schema]
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