const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkSchema = new Schema({
    user_preview_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    content_type: {
        type: String,
        required: true
    },

    content_id: {
        type: mongoose.Types.ObjectId,
        required: true
    }

})

const BookmarkModel = mongoose.model('bookmark', BookmarkSchema);

module.exports = {
    Schema: BookmarkSchema,
    Model: BookmarkModel
}