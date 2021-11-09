let { NoContentError, TypeError } = require("./errors");
const AWSConstants = require('./utils/aws');
let { NO_CONTENT,
    NO_COMMENT_FOUND,
    NO_POST_FOUND,
    NO_USER_FOUND,
    NO_USER_PREVIEW_FOUND,
    NO_USER_RELATION_FOUND,
    WRONG_TYPE,
    NO_PROJECT_FOUND } = require('./utils/messages');
const uuid = require('uuid');

const isEmpty = (...input) => {
    let testString = [...input];
    for (const string of testString) {
        if (string === undefined || string === null) {
            return true;
        }
    }
    return false;
}

const verifyArray = (value) => {
    if (Array.isArray(value)) return value;
    else {
        return [value];
    }
}

// const validateUsername = (username) => {
//     if (username === undefined || username === null)
//         throw new BadRequestError(NO_USERNAME_SUPPLIED);
//     else {
//         return username;
//     }
// }

const checkStringBoolean = (string) => {
    if (typeof string === 'string' || string instanceof String) {
        return string.trim().toLowerCase() === 'true'
    }
    else if (typeof string === 'boolean' || string instanceof Boolean) {
        return string;
    }
    else {
        return new TypeError(WRONG_TYPE);
    }
}

const doesContentExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_CONTENT);
    };
}

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
const doesProjectExist = (result) => {
    if (!result) {
        throw new NoContentError(NO_PROJECT_FOUND);
    };
}

const copyObject = (key) => {
    const newFileKey = "images/content/" + uuid.v1();
    const copySource = AWSConstants.BUCKET_NAME + '/' + key;
    return new Promise((resolve, reject) => {
        AWSConstants.S3_INTERFACE.copyObject(
            {
                Bucket: AWSConstants.BUCKET_NAME,
                CopySource: copySource,
                Key: newFileKey,
            },
            (err, res) => {
                res.Key = newFileKey;
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                }
                resolve(res)
            });
        // )
        // axios.put(url, {
        //     Host: AWSConstants.BUCKET_NAME + '.s3.amazonaws.com',
        //     Key: key,
        // },
        //     (err, res, body) => {
        //         if (err) reject(err)
        //         resolve(body)
        //     });
    })
}

module.exports = {
    checkStringBoolean,
    isEmpty,
    doesContentExist,
    doesCommentExist,
    doesPostExist,
    doesProjectExist,
    doesUserExist,
    doesUserPreviewExist,
    doesUserRelationExist,
    copyObject,
    verifyArray,
    // validateUsername: validateUsername
}