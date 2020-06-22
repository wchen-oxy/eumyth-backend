const mongoose = require('mongoose');
let Event = require('./event.model');
const Schema = mongoose.Schema;

const pursuitSchema = new Schema({
  name: {
    type: String,
    required: false,
    trim: true
   
  },
  
  description: {
    type: String,
    required:  false,
  },

  events: [Event.Schema]
 
}, {
  timestamps: true,
});

const pursuitModel = mongoose.model('Pursuit', pursuitSchema);

module.exports = {
  Schema: pursuitSchema,
  Model : pursuitModel
};