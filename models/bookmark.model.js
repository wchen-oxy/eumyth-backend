const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkSchema = new Schema({
    user_preview_id: {
        type: mongoose.Types.ObjectId
    },

    project_id: {
        type: mongoose.Types.ObjectId
    }

})

const BookmarkModel = mongoose.model('bookmark', BookmarkSchema);

module.exports = {
    Schema: BookmarkSchema,
    Model: BookmarkModel
}