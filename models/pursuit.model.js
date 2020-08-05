const mongoose = require('mongoose');
let Event = require('./event.model');
const Schema = mongoose.Schema;

const pursuitSchema = new Schema({
  name: {
    type: String,
    required: false,
    trim: true
   
  },

  experienceLevel: {
    type: String,
    required: false,
    trim: true
   
  },

  eventDataRef: {
    type: mongoose.Types.ObjectId
  },
  
  totalMin: {
    type: Number,
    required:  false,
  }
 
}, {
  timestamps: true,
});

const pursuitModel = mongoose.model('Pursuit', pursuitSchema);

module.exports = {
  Schema: pursuitSchema,
  Model : pursuitModel
};