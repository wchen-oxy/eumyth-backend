const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userPreview = require("./user.preview.model");


const userRelationSchema = new Schema({
    parent_index_user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    following: [userPreview.Schema],
    followers: [userPreview.Schema]
});


const userRelationModel = mongoose.model('user_relation', userRelationSchema);

module.exports = {
    Schema: userRelationSchema,
    Model: userRelationModel
};