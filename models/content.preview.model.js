const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentPreviewSchema = new Schema({
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

},
  {
    timestamps: true,
  }
);

const ContentPreviewModel = mongoose.model('content_preview', ContentPreviewSchema);

module.exports = {
  Schema: ContentPreviewSchema,
  Model: ContentPreviewModel
}
