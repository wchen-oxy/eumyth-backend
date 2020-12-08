const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const indexPursuitSchema = new Schema({
    name: String,

    experience_level: {
        type: String,
        required: false,
        trim: true
    },

    num_posts: {
        type: Number,
        required: false
    },

    num_milestones: {
        type: Number,
        required: false
    },

    num_projects: {
        type: Number,
        required: false,
    },

    total_min: {
        type: Number,
        required: false,
    }
});

const indexPursuitModel = mongoose.model('index_pursuit', indexPursuitSchema);

module.exports = {
    Schema: indexPursuitSchema,
    Model: indexPursuitModel
};