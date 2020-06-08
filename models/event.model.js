const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true 
  },
  type: {
    type: String,
    required:  true,
  },
  description: {
    type: String,
    required: false  
}
}, {
  timestamps: true,
});

const eventModel = mongoose.model('Event', eventSchema);

module.exports = {
    Schema: eventSchema,
    Model : eventModel
};