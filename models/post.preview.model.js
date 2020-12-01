const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postPreview = new Schema ({
    post_id : {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  
    date : {
      type : Date,
    }
  });

  const postPreviewModel = mongoose.model('post_preview', postPreview);

  module.exports = {
      Schema: postPreviewSchema,
      Model: postPreviewModel
  }
