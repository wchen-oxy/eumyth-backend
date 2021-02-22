const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserRelationStatus = require("./user.relation.status.model");
const UserRelationSchema = new Schema({
    parent_index_user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    following: [UserRelationStatus.Schema],

    followers: [UserRelationStatus.Schema]
});


const UserRelationModel = mongoose.model('user_relation', UserRelationSchema);

module.exports = {
    Schema: UserRelationSchema,
    Model: UserRelationModel
};