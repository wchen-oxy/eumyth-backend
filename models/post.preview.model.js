const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostPreviewSchema = new Schema({
  _id: false,

  post_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },

  date: {
    type: Date,
  },

  labels: {
    type: [String]
  },

  branch: {
    type: mongoose.Types.ObjectId
  }

});

const PostPreviewModel = mongoose.model('post_preview', PostPreviewSchema);

module.exports = {
  Schema: PostPreviewSchema,
  Model: PostPreviewModel
}
