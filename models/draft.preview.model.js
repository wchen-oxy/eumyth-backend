const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DraftPreviewSchema = new Schema({
    _id: false,
    title: String,
    content_id: mongoose.Types.ObjectId,
    project_preview_id: mongoose.Types.ObjectId,
    pursuit: String,
})

const DraftPreviewModel = mongoose.model('draft_preview', DraftPreviewSchema);
module.exports = {
    Schema: DraftPreviewSchema,
    Model: DraftPreviewModel
}