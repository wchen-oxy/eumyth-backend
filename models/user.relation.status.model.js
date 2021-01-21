const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userRelationStatusSchema = new Schema({
    _id: false,

    user_preview_id: [mongoose.Types.ObjectId],

    status: { type: String },
})

const userRelationStatusModel = mongoose.model('user_relation_status', userRelationStatusSchema);

module.exports = {
    Schema: userRelationStatusSchema,
    Model: userRelationStatusModel
};