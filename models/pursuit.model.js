const postPreview = require('./post.preview.model');
const Project = require('./project.model');
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
  num_posts: {
    type: Number,
    required: false
  },

  num_milestones: {
    type: Number,
    required: false
  },

  all_posts: {
    type: [mongoose.Types.ObjectId]
  },

  dated_posts: {
    type: [postPreview.Schema]
  },

  undated_posts: {
    type: [mongoose.Types.ObjectId]
  },

  projects: {
    type: [mongoose.Types.ObjectId]
  }

}, {
  timestamps: true,
});

const PursuitModel = mongoose.model('pursuit', PursuitSchema);

module.exports = {
  Schema: PursuitSchema,
  Model: PursuitModel
};