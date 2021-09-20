const { doesCommentExist,
    doesUserExist,
    doesUserPreviewExist,
    doesPostExist,
    doesProjectExist,
    doesUserRelationExist } = require("../utils/helper");
const Comment = require('../models/comment.model');
const IndexUser = require('../models/index.user.model');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const UserPreview = require("../models/user.preview.model");
const UserRelation = require("../models/user.relation.model");
const Project = require("../models/project.model");
const Helper = require('../constants/helper');

const deleteCommentsByID = (commentIDArray) => {
    return Comment.Model.deleteMany({
        _id: {
            $in: commentIDArray
        }
    },
        (err) => {
            if (err) {
                throw new Error(500, err);
            }
        })
}
//IndexUser

const retrieveIndexUserByList = (indexUserIDArray) => {
    return IndexUser.Model.find({
        '_id': { $in: indexUserIDArray }, function(error, docs) {
            if (error) console.log(error);
            else {
                console.log(docs);
            }
        }
    });
}

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

const findProjectByID = (projectID) => {
    return Project.Model.findById(projectID)
        .then(result => {
            doesProjectExist(result);
            return result;
        });
}
const findProjectsByID = (projectIDArray) => {
    return Project.Model.find({
        '_id': { $in: projectIDArray }, function(err, docs) {
            if (err) console.log(err);
            else {
                console.log(docs);
            }
        }
    });
}

//Post

const deletePostByID = (postID) => {
    return Post.Model.deleteOne({ _id: postID });
}

const retrievePostByID = (postID) => {
    return Post.Model.findById(postID)
        .then(result => {
            doesPostExist(result);
            return result;
        })
}

const updatePostUserDisplayPhoto = (username, imageKey) => {
    return Post.Model.updateMany(
        { username: username },
        { display_photo_key: imageKey }
    );
}

const findPostInList = (postIDList, isOrganized) => {
    if (isOrganized) {
        return Post.Model.find({
            '_id': { $in: postIDList }, function(error, docs) {
                if (error) console.log(error);
                else {
                    console.log(docs);
                }
            }
        }).sort({ createdAt: -1 }).lean();
    }
    else {
        return Post.Model.find({
            '_id': { $in: postIDList }, function(error, docs) {
                if (error) console.log(error);
                else {
                    console.log(docs);
                }
            }
        })
    }
}


const retrieveUserByID = (userID) => {
    return User.Model.findById(userID)
        .then(result => {
            doesUserExist(result);
            return result;
        });
}


const retrieveUserByUsername = (username) => {
    return User.Model.findOne({ username: username })
        .then(result => {
            doesUserExist(result);
            return result;
        });
}

//UserPreview

const retrieveUserPreviewByUsername = (username) => {
    return UserPreview.Model.findOne({ username: username })
        .then(result => {
            doesUserPreviewExist(result);
            return result;
        });
}

const retrieveUserPreviewByID = (userPreviewID) => {
    return UserPreview.Model.findById(userPreviewID)
        .then(result => {
            doesUserPreviewExist(result);
            return result;
        });
}

const findUserPreviewByIDList = (userProfileIDArray) => {
    return UserPreview.Model.find({
        '_id': { $in: userProfileIDArray }
    }, Helper.resultCallback)
}

const findUserRelations = (userRelationArray) => {
    return UserRelation.Model.find({
        '_id': { $in: userRelationArray }, function(error, docs) {
            if (error) console.log(error);
            else {
                console.log(docs);
            }
        }
    })
}

const retrieveUserRelationByID = (userRelationID) => {
    return UserRelation.Model.findById(userRelationID)
        .then(result => {
            doesUserRelationExist(result);
            return result;
        })
}

const retrieveCommentByID = (commentID) => {
    return Comment.Model.findById(commentID)
        .then(result => {
            doesCommentExist(result);
            return result;
        })
}
const findComments = (commentIDArray) => {
    return Comment.Model
        .find({
            '_id': { $in: commentIDArray }
        }, Helper.resultCallback)
        .lean();
}

module.exports = {
    deleteCommentsByID,
    retrieveCommentByID,
    findComments,
    retrieveIndexUserByID,
    retrieveIndexUserByList,
    retrieveIndexUserByUsername,
    retrieveCompleteUserByID,
    retrieveCompleteUserByUsername,
    retrieveUserByID,
    retrieveUserByUsername,
    retrieveUserPreviewByID,
    findUserPreviewByIDList,
    retrieveUserPreviewByUsername,
    findUserRelations,
    retrieveUserRelationByID,
    findProjectByID,
    findProjectsByID,
    deletePostByID,
    retrievePostByID,
    updatePostUserDisplayPhoto,
    findPostInList
}

