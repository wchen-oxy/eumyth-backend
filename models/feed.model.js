const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FeedSchema = new Schema({
    following:{ 
        type:[mongoose.Types.ObjectId],
        default: [],
    },

    parents:{
        type:[mongoose.Types.ObjectId],
        default: [],
    },

    siblings: {
        type:[mongoose.Types.ObjectId],
        default: [],
    },

    children: {
        type:[mongoose.Types.ObjectId],
        default: [],
    }
})

const FeedModel = mongose.model('feed', FeedSchema);

module.exports = {
    Schema: FeedSchema,
    Model: FeedModel
}