const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserRelationStatusSchema = new Schema({
    _id: false,

    user_preview_id: mongoose.Types.ObjectId,

    status: { type: String },
})

const UserRelationStatusModel = mongoose.model('user_relation_status', UserRelationStatusSchema);

module.exports = {
    Schema: UserRelationStatusSchema,
    Model: UserRelationStatusModel
};