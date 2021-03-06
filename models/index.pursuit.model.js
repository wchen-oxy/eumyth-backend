const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IndexPursuitSchema = new Schema({
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
    },
    
    meta_template: String,

});

const IndexPursuitModel = mongoose.model('index_pursuit', IndexPursuitSchema);

module.exports = {
    Schema: IndexPursuitSchema,
    Model: IndexPursuitModel
};