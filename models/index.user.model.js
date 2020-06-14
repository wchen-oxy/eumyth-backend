const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const indexUserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true

        },
        uid: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        private: {
            type: Boolean,
            required: true,
        }
    }
);

const indexUserModel = mongoose.model('Index-User', indexUserSchema);

module.exports = {
    Schema: indexUserSchema,
    Model: indexUserModel
};