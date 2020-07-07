const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const indexEventSchema = new Schema({
    name: String,

    numEvent: {
        type: Number,
        required: false
    },
    

}); 
const indexUserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true

        },
        userProfileRef: {
            type: mongoose.Types.ObjectId,
            required: true,
            unique: true,
            trim: true
        },

        private: {
            type: Boolean,
            required: true,
        },
        pursuits: [indexEventSchema]
    }
);

const indexUserModel = mongoose.model('Index-User', indexUserSchema);

module.exports = {
    Schema: indexUserSchema,
    Model: indexUserModel
};