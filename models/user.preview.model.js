const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userPreviewSchema = new Schema({
    _id: false,

    parent_index_user_id: {
        type: mongoose.Types.ObjectId,
    },

    user_relation_id: {
        type: mongoose.Types.ObjectId,
    },

    username: {
        type: String,
    },

    name: {
        type: String
    },

    small_cropped_display_photo_key: {
        type: String,
        required: false
    },

    tiny_cropped_display_photo_key: {
        type: String,
        required: false
    },
    
});

const userPreviewModel = mongoose.model('user_preview', userPreviewSchema);

module.exports = {
    Schema: userPreviewSchema,
    Model: userPreviewModel
}