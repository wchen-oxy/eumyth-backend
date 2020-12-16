const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const draftSchema = new Schema(
    {
        _id: false,

        text: {
            type: String,
            required: false,
            trim: true
        },

        links: {
            type: [String],
            required: false
        }

        // description: {
        //     type: String,
        //     required: false,
        //     trim: true
        // },

        // date: {
        //     type: Date,
        //     required: false,
        // },

        // cover_photo_key: {
        //     type: String,
        //     required: false,
        // },

        // pursuit_category: {
        //     type: String,
        //     required: false,
        //     trim: true
        // },

        // is_milestone: {
        //     type: Boolean,
        //     required: false,
        // },

        // min_duration: {
        //     type: Number,
        //     required: false
        // },


        // text_data: {
        //     type: String,
        //     required: false
        // }

    }

)
const draftModel = mongoose.model('draft', draftSchema);

module.exports = {
    Schema: draftSchema,
    Model: draftModel
};