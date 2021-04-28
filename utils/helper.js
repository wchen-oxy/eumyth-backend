let { NoContentError } = require("./errors");
let { NO_USER_FOUND } = require('../constants/messages');

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


const doesUserExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_USER_FOUND);
    };
};

module.exports = {
    isEmpty,
    doesUserExist
    // validateUsername: validateUsername
}