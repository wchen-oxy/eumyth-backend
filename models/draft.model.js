const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const draftSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  subtitle: {
    type: String,
    trim: false
  },

  type: {
    type: String,
    required: true,
  },

  cover: {
    type: mongoose.Types.ObjectId,
    required: false,
  },

  draftData: {
    type: Schema.Types.Mixed,
    required: false
  },
  durationHour: {
    type: Number,
    required: false
  },
  durationMin: {
    type: Number,
    required: false
  },
}, {
  timestamps: true,
});

const draftModel = mongoose.model('Draft', draftSchema);

module.exports = {
  Schema: draftSchema,
  Model: draftModel
};