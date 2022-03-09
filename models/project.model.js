const mongoose = require('mongoose');
const ProjectPreview = require('./project.preview.model');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  username: {
    type: String,
    required: false,
    trim: true
  },

  index_user_id: {
    type: mongoose.Types.ObjectId,
    required: false,
    trim: true
  },

  project_preview_id: {
    type: mongoose.Types.ObjectId,
    required: false,
  },

  display_photo_key: {
    type: String,
    required: false,
    trim: true
  },

  title: {
    type: String,
    required: false,
    trim: true
  },

  subtitle: {
    type: String,
    required: false,
    trim: true
  },

  pursuit: {
    type: String,
    required: false,
    trim: true
  },

  overview: {
    type: String,
    required: false,
    trim: true
  },

  cover_photo_key: {
    type: String,
    required: false,
    trim: false
  },

  start_date: {
    type: Date,
    required: false
  },

  end_date: {
    type: Date,
    required: false
  },

  status: {
    type: String,
    required: false,
  },

  min_duration: {
    type: Number,
    required: false
  },

  post_ids: {
    type: [mongoose.Types.ObjectId],
    default: [],
    required: false,
  },

  labels: {
    type: [String],
    default: [],
    required: false,
  },

  ancestors: {
    type: [ProjectPreview.Schema.NoID],
    default: []
  },

  children: {
    type: [ProjectPreview.Schema.NoID],
    default: []
  },

  children_length: {
    type: Number,
    default: 0
  },

  remix: {
    type: String
  },

  bookmarks: {
    type: [mongoose.Types.ObjectId],
    default: []
  },

  likes: {
    type: [mongoose.Types.ObjectId],
    default: [],
    required: false,
  },

  dislikes: {
    type: [mongoose.Types.ObjectId],
    default: []
  }
});

const ProjectModel = mongoose.model('project', ProjectSchema);

module.exports = {
  Schema: ProjectSchema,
  Model: ProjectModel
};