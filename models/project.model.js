const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const projectSchema = new Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
  
    cover_image_url : {
      type: String,
      required: false,
      trim: false
    },
  
    post_ids : {
      type: [mongoose.Types.ObjectId]
    }
  });

  const projectModel = mongoose.model('project', projectSchema);

  module.exports = {
    Schema: projectSchema,
    Model: projectModel
  };