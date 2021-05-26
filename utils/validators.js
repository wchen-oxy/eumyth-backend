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
const validateQueryPostIDList = [query('postIDList').exists()];
const validateQueryTextOnly = [query('textOnly').exists()];
const validateQueryImageKey = [query('imageKey').exists()];
const validateQueryIncludePostText = [query('includePostText').exists()];
const validateQueryProjectIDList = [query('projectIDList').exists()];
const validateQueryRootCommentIDArray = [query('rootCommentIDArray').exists()];
const validateQueryUserRelationArrayID = [query('userRelationArrayId').exists()];
const validateQueryViewingMode = [query('viewingMode').exists()];

const validateBodyAction = [body('action').exists()];
const validateBodyAncestors = [body('ancestors').exists()];
const validateBodyComment = [body('comment').exists()];
const validateBodyCommentID = [body('commentID').exists()];
const validateBodyDraft = [body('draft').exists()];
const validateBodyDraftTitle = [body('draftTitle').exists()];
const validateBodyDisplayPhoto = [body('displayPhoto').exists()];
const validateBodyTargetProfilePreviewID = [body('targetProfilePreviewID').exists()];
const validateBodyFullNames = [body("firstName").exists(), body("lastName").exists()];
const validateBodyUsername = [body("username").exists()];
const validateBodyImageKey = [body('imageKey').exists()];
const validateBodyKeys = [body('keys').exists()];
const validateBodyPursuitArray = [body("pursuitArray").exists()];
const validateBodyProfilePreviewID = [body('profilePreviewID').exists()];
const validateBodyVisitorUsername = [body("visitorUsername").exists()];
const validateBodyVoteValue = [body('voteValue').exists()];
const validateBodyIndexUserID = [body('indexUserID').exists()];
const validateBodyUserID = [body('userID').exists()];
const validateBodyUserRelationArrayID = [body('userRelationArrayID').exists()];
const validateBodyCurrentUsername = [body('currentUsername').exists()];
const validateBodyTargetUsername = [body('targetUsername').exists()];
const validateBodyText = [body('text').exists()];
const validateBodyPursuit = [body('pursuit').exists()];
const validateBodyBio = [body('bio').exists()];
const validateBodySelectedPosts = [body('selectedPosts').exists()];
const validateBodyTitle = [body('title').exists()];
const validateBodyPostPrivacy = [body('postPrivacyType').exists()];
const validateBodyPostType = [body('postType').exists()];
const validateBodyCompressedImageSet = [
    body(CROPPED_IMAGE).custom(imageFileWrapper),
    body(SMALL_CROPPED_IMAGE).custom(imageFileWrapper),
    body(TINY_CROPPED_IMAGE).custom(imageFileWrapper)
];
const validateBodyID = [body('ID').exists()];
const validateBodyPostID = [body('postID').exists()];
const validateBodyRemoveCoverPhoto = [body('removeCoverPhoto').exists()];
const validateBodyProgression = [body('progression').exists()];
const validateBodyIsPaginated = [body('isPaginated').exists()];
const validateBodyIsPrivate = [body('IsPrivate').exists()];


module.exports = {
    doesValidationErrorExist,
    validateQueryUsername,
    validateQueryFullNames,
    validateQueryPostID,
    validateQueryPostIDList,
    validateQueryImageKey,
    validateQueryIncludePostText,
    validateQueryProjectIDList,
    validateQueryRootCommentIDArray,
    validateQueryUserRelationArrayID,
    validateQueryTextOnly,
    validateQueryViewingMode,
    validateBodyAction,
    validateBodyAncestors,
    validateBodyKeys,
    validateBodyComment,
    validateBodyCommentID,
    validateBodyDraft,
    validateBodyDraftTitle,
    validateBodyUserRelationArrayID,
    validateBodyFullNames,
    validateBodyUsername,
    validateBodyImageKey,
    validateBodyBio,
    validateBodySelectedPosts,
    validateBodyTitle,
    validateBodyCompressedImageSet,
    validateBodyDisplayPhoto,
    validateBodyID,
    validateBodyPostID,
    validateBodyRemoveCoverPhoto,
    validateBodyIsPaginated,
    validateBodyProgression,
    validateBodyPursuitArray,
    validateBodyPostPrivacy,
    validateBodyIsPrivate,
    validateBodyPostType,
    validateBodyProfilePreviewID,
    validateBodyVisitorUsername,
    validateBodyVoteValue,
    validateBodyIndexUserID,
    validateBodyUserID,
    validateBodyUserRelationArrayID,
    validateBodyCurrentUsername,
    validateBodyTargetProfilePreviewID,
    validateBodyTargetUsername,
    validateBodyText,
    validateBodyPursuit
}