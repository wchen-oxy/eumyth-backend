let { NoContentError } = require("./errors");
let { NO_COMMENT_FOUND, NO_POST_FOUND, NO_USER_FOUND, NO_USER_PREVIEW_FOUND, NO_USER_RELATION_FOUND } = require('../constants/messages');

const isEmpty = (...input) => {
    let testString = [...input];
    for (const string of testString) {
        if (string === undefined || string === null) {
            return true;
        }
    }
    return false;
}

// const validateUsername = (username) => {
//     if (username === undefined || username === null)
//         throw new BadRequestError(NO_USERNAME_SUPPLIED);
//     else {
//         return username;
//     }
// }

const checkStringBoolean = (string) => string.trim().toLowerCase() === 'true';

const doesCommentExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_COMMENT_FOUND);
    };
}

const doesUserPreviewExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_USER_PREVIEW_FOUND);
    };
}

const doesUserRelationExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_USER_RELATION_FOUND);
    };
}
const doesUserExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_USER_FOUND);
    };
};

const doesPostExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_POST_FOUND);
    };
}

module.exports = {
    checkStringBoolean,
    isEmpty,
    doesCommentExist,
    doesPostExist,
    doesUserExist,
    doesUserPreviewExist,
    doesUserRelationExist
    // validateUsername: validateUsername
}