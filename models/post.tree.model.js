const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostTreeSchema = new Schema({
    parent: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    ancestors: {
        type: [mongoose.Types.ObjectId],
        required: true
    }

});

const PostTreeModel = mongoose.model('post_tree', PostTreeSchema);

module.exports = {
    Schema: PostTreeSchema,
    Model: PostTreeModel
};