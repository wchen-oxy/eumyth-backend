const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IndexRecentSchema = new Schema({
    _id: false,
    post_id: {
        type: mongoose.Types.ObjectId,
    },

    project_preview_id: {
        type: mongoose.Types.ObjectId,
    },

});

const IndexRecentModel = mongoose.model('index_recent', IndexRecentSchema);

module.exports = {
    Schema: IndexRecentSchema,
    Model: IndexRecentModel
}