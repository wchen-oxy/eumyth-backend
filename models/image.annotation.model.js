const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnotationSchema = new Schema({
    _id: false,
    image_page_number: { type: Number },
    data: { type: String },
    geometry: { type: String },

});

const AnnotationModel = mongoose.model('annotation', AnnotationSchema);

module.exports = {
    Schema: AnnotationSchema,
    Model: AnnotationModel
};