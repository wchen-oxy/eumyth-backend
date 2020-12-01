const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postPreviewSchema = new Schema ({
    post_id : {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  
    date : {
      type : Date,
    }
  });

  const postPreviewModel = mongoose.model('post_preview', postPreviewSchema);

  module.exports = {
      Schema: postPreviewSchema,
      Model: postPreviewModel
  }
