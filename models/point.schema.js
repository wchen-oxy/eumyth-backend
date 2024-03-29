const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PointSchema = new Schema({
    _id: false,
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

module.exports = {
    Schema: PointSchema
}