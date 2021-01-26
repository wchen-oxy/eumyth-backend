const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const annotationSchema = new Schema({
    _id: false,
    data_annotation_id: Number,
    data_annotation_text: String,
    geometry_annotation_type: String,
    geometry_x_coordinate: Number,
    geometry_y_coordinate: Number,
    geometry_width: Number,
    geometry_height: Number,
},
    { timestamps: true }
);

const annotationModel = mongoose.model('annotation', annotationSchema);


module.exports = {
    Schema: annotationSchema,
    Model: annotationModel
};