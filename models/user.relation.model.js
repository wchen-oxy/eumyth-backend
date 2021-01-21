const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userStatusSchema = new Schema({
    _id: false,

    user_preview_id: [mongoose.Types.ObjectId],

    status: { type: String },
})

const userRelationSchema = new Schema({
    parent_index_user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    following: [userStatusSchema],
    
    followers: [userStatusSchema]
});


const userRelationModel = mongoose.model('user_relation', userRelationSchema);

module.exports = {
    Schema: userRelationSchema,
    Model: userRelationModel
};