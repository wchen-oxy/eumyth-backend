const { doesUserExist } = require("../utils/helper");
const IndexUser = require('../models/index.user.model');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const userPreview = require("../models/user.preview.model");

//IndexUser
const retrieveIndexUserByUsername = (username) => {
    return IndexUser.Model
        .findOne({ username: username })
        .then(result => {
            doesUserExist(result);
            return result;
        });
}

const retrieveIndexUserByID = (id) => {
    return IndexUser.Model.findById(id)
        .then(result => {
            doesUserExist(result);
            return result;
        });
}

//User
const retrieveCompleteUserByUsername = (username) => {
    return User.Model
        .findOne({ username: username })
        .then(result => {
            doesUserExist(result);
            return result;
        });
}

const retrieveCompleteUserByID = (id) => {
    return User.Model.findById(id)
        .then(result => {
            doesUserExist(result);
            return result;
        });
}

//Post

const retrievePostInList = (postIDList, includePostText) => {
    return Post.Model.find({
        '_id': { $in: postIDList }, function(error, docs) {
            if (error) console.log(error);
            else {
                console.log(docs);
            }
        }
    }).sort({ createdAt: -1 }).lean()

}

//UserPreview

const retriveUserPreviewByUsername = (username) => {
    return userPreview.Model.findOne({ username: username })
        .then(result => {
            doesUserExist(result);
            return result;
        });
}

module.exports = {
    retrieveIndexUserByID,
    retrieveIndexUserByUsername,
    retrieveCompleteUserByID,
    retrieveCompleteUserByUsername,
    retriveUserPreviewByUsername,
    retrievePostInList
}

