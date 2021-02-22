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
  }
});

const PostPreviewModel = mongoose.model('post_preview', PostPreviewSchema);

module.exports = {
  Schema: PostPreviewSchema,
  Model: PostPreviewModel
}
