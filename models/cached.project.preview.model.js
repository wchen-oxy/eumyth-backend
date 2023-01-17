const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CachedProjectPreviewSchema = new Schema({
    project_preview_id: mongoose.Types.ObjectId,


})

const CachedProjectPreviewModel = mongoose.model('cachedProjectPreview', CachedProjectPreviewSchema);

module.exports = {
    Schema: CachedProjectPreviewSchema,
    Model: CachedProjectPreviewModel

};