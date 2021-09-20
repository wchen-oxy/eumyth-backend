const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefSchema = new Schema({
    _id: false,
    id: mongoose.Types.ObjectId, //post ID
    title: String, //project title
})

const RefModel = mongoose.model('ref', RefSchema);

module.exports = {
    Schema: RefSchema,
    Model: RefModel
};