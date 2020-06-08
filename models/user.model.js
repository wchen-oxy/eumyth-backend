const mongoose = require('mongoose');
let Pursuit = require('./pursuit.model');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    trim: true
   
  },
  pursuits:[Pursuit.Schema]

}, {
  timestamps: true,
});

const userModel = mongoose.model('User', userSchema);

module.exports = {
  Schema : userSchema,
  Model : userModel
};