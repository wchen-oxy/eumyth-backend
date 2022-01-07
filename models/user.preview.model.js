const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Pursuits = require('./pursuit.model');

const UserPreviewSchema = new Schema({

    parent_index_user_id: {
        type: mongoose.Types.ObjectId,
    },

    user_relation_id: {
        type: mongoose.Types.ObjectId,
    },

    username: {
        type: String,
    },

    first_name: {
        type: String,
        required: false
    },

    last_name: {
        type: String,
        required: false
    },

    small_cropped_display_photo_key: {
        type: String,
        required: false
    },

    tiny_cropped_display_photo_key: {
        type: String,
        required: false
    },

    pursuits: [Pursuits.Schema],


});

const UserPreviewModel = mongoose.model('user_preview', UserPreviewSchema);

module.exports = {
    Schema: UserPreviewSchema,
    Model: UserPreviewModel
}