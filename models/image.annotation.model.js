const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const annotationSchema = new Schema({
    _id: false,
    annotation_id: Number,
    annotation_type: String,
    x_coordinate: Number,
    y_coordinate: Number,
    width: Number,
    height: Number,
    text: String,
},
    { timestamps: true }
);

const annotationModel = mongoose.model('annotation', annotationSchema);


module.exports = {
    Schema: annotationSchema,
    Model: annotationModel
};