const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
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


  description: {
    type: String,
    required: false,
    trim: true
  },

  cover_photo_url: {
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

const projectModel = mongoose.model('project', projectSchema);

module.exports = {
  Schema: projectSchema,
  Model: projectModel
};