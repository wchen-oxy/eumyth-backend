const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserRelationStatus = require("./user.relation.status.model");
const userRelationSchema = new Schema({
    parent_index_user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    following: [UserRelationStatus.Schema],

    followers: [UserRelationStatus.Schema]
});


const userRelationModel = mongoose.model('user_relation', userRelationSchema);

module.exports = {
    Schema: userRelationSchema,
    Model: userRelationModel
};