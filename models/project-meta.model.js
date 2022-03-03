const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectMetaSchema = new Schema({
    parent_project_id: {
        type: mongoose.Types.ObjectId,
    },
    owner_project_id: {
        type: mongoose.Types.ObjectId,
    },
    milestones: {
        type: Number,
    },
    setbacks: {
        type: Number
    },
    min_duration: {
        type: Number
    },

    start_date: {
        type: Date,
        required: false
    },

    end_date: {
        type: Date,
        required: false
    },
    is_complete: {
        type: boolean
    },

    is_private: {
        type: boolean
    }
})

const ProjectMetaModel = mongoose.model('project', ProjectMetaSchema);

module.exports = {
    Schema: ProjectMetaSchema,
    Model: ProjectMetaModel
};