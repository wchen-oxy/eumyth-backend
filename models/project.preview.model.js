const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ProjectPreviewWithIDSchema = new Schema({
    title: String,
    index_user_id: mongoose.Types.ObjectId,
    ancestor_id: mongoose.Types.ObjectId,
    remix: String,
    cached_feed_id: mongoose.Types.ObjectId,
    project_id: mongoose.Types.ObjectId,
    parent_project_id: mongoose.Types.ObjectId, //needed for searching related parent projects
    has_children: { type: Boolean, default: false },
    overview: String,
    mini_cover_photo_key: String,
    status: String,
    pursuit: String,
    labels: {
        type: [String],
        default: []
    }
}, {
    timestamps: true,
})

const ProjectPreviewWithIDModel = mongoose.model('project_preview', ProjectPreviewWithIDSchema);

const ProjectPreviewNoIDSchema = new Schema({
    _id: false,
    title: String,
    remix: String,
    cached_feed_id: mongoose.Types.ObjectId,
    index_user_id: mongoose.Types.ObjectId,
    project_id: mongoose.Types.ObjectId,
    parent_project_id: mongoose.Types.ObjectId, //needed for searching related parent projects
    status: String,
    pursuit: String,
    labels: {
        type: [String],
        default: []
    }
})

const ProjectPreviewNoIDModel = mongoose.model('project_preview_no_id', ProjectPreviewNoIDSchema);

module.exports = {
    Model: { WithID: ProjectPreviewWithIDModel, NoID: ProjectPreviewNoIDModel },
    Schema: { WithID: ProjectPreviewWithIDSchema, NoID: ProjectPreviewNoIDSchema, }
};