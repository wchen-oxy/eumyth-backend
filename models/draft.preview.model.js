const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DraftPreviewSchema = new Schema({
    title: String,
    content_id: mongoose.Types.ObjectId
})

const DraftPreviewModel = mongoose.model('draft_preview', DraftPreviewSchema);
module.exports = {
    Schema: DraftPreviewSchema,
    Model: DraftPreviewModel
}