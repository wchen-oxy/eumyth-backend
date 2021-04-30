const { custom, body, query, validationResult } = require('express-validator');
const { BadRequestError } = require('./errors');

const CROPPED_IMAGE = "croppedImage";
const SMALL_CROPPED_IMAGE = "smallCroppedImage";
const TINY_CROPPED_IMAGE = "tinyCroppedImage";

const checkBodyExists = (type) => {
    if (type === "HEAD" ||
        type === "GET" ||
        type === "DELETE") {
        return false;
    }
    else {
        return true;
    }
}


const doesValidationErrorExist = (req, res, next) => {
    const extractedParams = [];
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    errors.array().map(err => extractedParams.push(err.param));
    throw new BadRequestError(extractedParams.join(', ')
        .concat(extractedParams.length > 1 ? " are missing" : " is missing"));
}

const imageFileWrapper = (value, { req }) => {
    if (!req.files.croppedImage || !req.files.smallCroppedImage || !req.files.tinyCroppedImage) {
        return false;
    }
    return true;
};

const validateQueryUsername = [query("username").exists()];
const validateQueryFullNames = [query("firstName").exists(), query("lastName").exists()];
const validateQueryPostID = [query('postID').exists()];
const validateQueryTextOnly = [query('textOnly').exists()];
const validateQueryIncludePostText = [query('inludePostText').exists()]
const validateBodyFullNames = [body("firstName").exists(), body("lastName").exists()];
const validateBodyUsername = [body("username").exists()];
const validateBodyImageKey = [body('imageKey').exists()];
const validateBodyPursuits = [body("pursuits").exists()];
const validateBodyIndexUserID = [body('indexUserID').exists()];
const validateBodyUserID = [body('userId').exists()];
const validateBodyText = [body('text').exists()];
const validateBodyPursuit = [body('pursuit').exists()];
const validateBodyBio = [body('body').exists()];
const validateBodyPrivate = [body('private').exists()];
const validateBodyPostPrivacy = [body('postPrivacyType').exists()];
const validateBodyPostType = [body('postType').exists()];
const validateBodyCompressedImageSet = [
    body(CROPPED_IMAGE).custom(imageFileWrapper),
    body(SMALL_CROPPED_IMAGE).custom(imageFileWrapper),
    body(TINY_CROPPED_IMAGE).custom(imageFileWrapper)
];
const validateBodyPostID = [body('postID').exists()];
const validateBodyIsMilestone = [body('isMilestone').exists()];
const validateBodyIsPaginated = [body('isPaginated').exists()];

module.exports = {
    doesValidationErrorExist,
    validateQueryUsername,
    validateQueryFullNames,
    validateQueryPostID,
    validateQueryIncludePostText,
    validateQueryTextOnly,
    validateBodyFullNames,
    validateBodyUsername,
    validateBodyImageKey,
    validateBodyBio,
    validateBodyPrivate,
    validateBodyCompressedImageSet,
    validateBodyPostID,
    validateBodyIsMilestone,
    validateBodyIsPaginated,
    validateBodyPursuits,
    validateBodyPostPrivacy,
    validateBodyPostType,
    validateBodyIndexUserID,
    validateBodyUserID,
    validateBodyText,
    validateBodyPursuit
}