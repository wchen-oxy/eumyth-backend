const mongoose = require('mongoose');
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
    required: false,
  },

  labels: {
    type: [String],
    required: false,
  },

  parent: {
    type: mongoose.Types.ObjectId
  },

  ancestors: {
    type: [mongoose.Types.ObjectId],
    default: []
  },

  children: {
    type: [mongoose.Types.ObjectId],
    default: []
  },

  children_length: {
    type: Number,
    default: 0
  }
});

const ProjectModel = mongoose.model('project', ProjectSchema);

module.exports = {
  Schema: ProjectSchema,
  Model: ProjectModel
};