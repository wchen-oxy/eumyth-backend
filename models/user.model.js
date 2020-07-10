const mongoose = require('mongoose');
let Pursuits = require('./pursuit.model');
let Event = require('./event.model');
let Draft = require('./draft.model');
const Schema = mongoose.Schema;


const innerPursuitSchema = new Schema({
  name: String,
  eventData: [Event.Schema],

}); 
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },

  bio: {
    type: String,
    trim: true
  },

  pursuits:[Pursuits.Schema],
  events: [innerPursuitSchema],
  draft: Draft.Schema

}, {
  timestamps: true,
});

const userModel = mongoose.model('User', userSchema);

module.exports = {
  Schema : userSchema,
  Model : userModel
};