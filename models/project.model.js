const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },

  author_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    trim: true
  },
  display_photo_key: {
    type: String,
    required: false,
    trim: true
  },

  title: {
    type: String,
    required: true,
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
    type: Date
  },

  end_date: {
    type: Date
  },

  is_complete: {
    type: Boolean,
    required: false,
  },

  min_duration: {
    type: Number,
    required: false
  },

  post_ids: {
    type: [mongoose.Types.ObjectId]
  }
});

const ProjectModel = mongoose.model('project', ProjectSchema);

module.exports = {
  Schema: ProjectSchema,
  Model: ProjectModel
};