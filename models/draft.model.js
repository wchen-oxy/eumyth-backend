const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DraftSchema = new Schema(
    {
        _id: false,

        title: {
            type: String,
            required: false,
            default: "",
            trim: true
        },

        text: {
            type: String,
            required: false,
            trim: true
        },

        links: {
            type: [String],
            required: false
        }

    }

)
const DraftModel = mongoose.model('draft', DraftSchema);

module.exports = {
    Schema: DraftSchema,
    Model: DraftModel
};