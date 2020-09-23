const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const userInfoSchema = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
    },

    username: {
        type: String,
    },

    name: {
        type: String
    }
})
const userRelationSchema = new Schema({
    following: [userInfoSchema],
    followers: [userInfoSchema]
});


const userRelationModel = mongoose.model('userRelation', userRelationSchema);

module.exports = {
    Schema: userRelationSchema,
    Model: userRelationModel
};