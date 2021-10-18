const { custom, body, query, validationResult } = require('express-validator');
const { BadRequestError } = require('../errors');

const PARAM_CONSTANTS = {
    ACTION: 'action',
    ANCESTORS: 'ancestors',
    COMMENT: 'comment',
    COMMENT_ID: 'commentID',
    DRAFT: 'draft',
    DRAFT_TITLE: 'draftTitle',
    DISPLAY_PHOTO: 'displayPhoto',
    TARGET_PROFILE_PREVIEW: 'targetProfilePreview',
    FIRST_NAME: 'firstname',
    IMAGE_KEY: 'imageKey',
    KEYS: 'keys',
    PURSUIT_ARRAY: 'pursuitArray',
    PROFILE_PREVIEW_ID: 'profilePreviewID',
    VOTE_VALUE: 'voteValue',
    INDEX_USER_ID: 'indexUserID',
    USER_ID: 'userID',
    USER_RELATION_ARRAY_ID: 'userRelationArrayID',
    CURRENT_USERNAME: 'currentUsername',
    TARGET_USERNAME: 'targetUsername',
    TEXT: 'text',
    PURSUIT: 'pursuit',
    POST_ID_LIST: 'postIDList',
    PROJECT_ID_LIST: 'projectIDList',
    PROJECT_ID: 'projectID',
    PROJECT_DATA: 'projectData',
    BIO: 'bio',
    SELECTED_POSTS: 'selectedPosts',
    TITLE: 'title',
    POST_PRIVACY: 'postPrivacyType',
    POST_TYPE: 'postType',
    CROPPED_IMAGE: 'croppedImage',
    SMALL_CROPPED_IMAGE: 'smallCroppedImage',
    TINY_CROPPED_IMAGE: 'tinyCroppedImage',
    ID: 'ID',

    REMOVE_COVER_PHOTO: 'removeCoverPhoto',
    PROGRESSION: 'progression',
    IS_PAGINATED: 'isPaginated',
    IS_PRIVATE: 'isPrivate',

    PROFILE_ID: 'profileID',
    USERNAME: 'username',
    VISITOR_USERNAME: 'visitorUsername',
    LAST_NAME: 'lastName',
    POST_ID: 'postID',
    TEXT_ONLY: 'textOnly',
    INCLUDE_POST_TEXT: 'includePostText',
    PROJECT_ID: 'projectID',
    ROOT_COMMENT_ID_ARRAY: 'rootCommentIDArray',
    USER_RELATION_ARRAY_ID: 'userRelationArrayID',
    VIEWING_MODE: 'viewingMode',
    SHOULD_DELETE_POSTS: 'shouldDeletePosts'
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


const buildQueryValidationChain = (...params) => {
    const chain = [];
    for (const param of params) {
        chain.push(query(param).exists());
    }
    return chain;
}
const buildBodyValidationChain = (...params) => {
    const chain = [];
    for (const param of params) {
        chain.push(body(param).exists());
    }
    return chain;
}

const validateQueryProfileID = [query("profileID").exists()];
const validateQueryUsername = [query("username").exists()];
const validateQueryVisitorUsername = [query("visitorUsername").exists()];
const validateQueryFullNames = [query("visitorUsername").exists(), query("lastName").exists()];
const validateQueryPostID = [query('postID').exists()];
const validateQueryPostIDList = [query('postIDList').exists()];
const validateQueryTextOnly = [query('textOnly').exists()];
const validateQueryImageKey = [query('imageKey').exists()];
const validateQueryIncludePostText = [query('includePostText').exists()];
const validateQueryProjectID = [query('projectID').exists()];
const validateQueryProjectIDList = [query('projectIDList').exists()];
const validateQueryRootCommentIDArray = [query('rootCommentIDArray').exists()];
const validateQueryUserRelationArrayID = [query('userRelationArrayID').exists()];
const validateQueryViewingMode = [query('viewingMode').exists()];
const validateQueryShouldDeletePosts = [query('shouldDeletePosts').exists()];

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
const validateBodyProjectID = [body('projectID').exists()];

const validateBodyProjectData = [body('projectData').exists()];
const validateBodyBio = [body('bio').exists()];
const validateBodySelectedPosts = [body('selectedPosts').exists()];
const validateBodyTitle = [body('title').exists()];
const validateBodyPostPrivacy = [body('postPrivacyType').exists()];
const validateBodyPostType = [body('postType').exists()];
const validateBodyCompressedImageSet = [
    body(PARAM_CONSTANTS.CROPPED_IMAGE).custom(imageFileWrapper),
    body(PARAM_CONSTANTS.SMALL_CROPPED_IMAGE).custom(imageFileWrapper),
    body(PARAM_CONSTANTS.TINY_CROPPED_IMAGE).custom(imageFileWrapper)
];
const validateBodyID = [body('ID').exists()];
const validateBodyPostID = [body('postID').exists()];
const validateBodyRemoveCoverPhoto = [body('removeCoverPhoto').exists()];
const validateBodyProgression = [body('progression').exists()];
const validateBodyIsPaginated = [body('isPaginated').exists()];
const validateBodyIsPrivate = [body('isPrivate').exists()];


module.exports = {
    doesValidationErrorExist,
    buildQueryValidationChain,
    buildBodyValidationChain,
    PARAM_CONSTANTS,
    validateQueryProfileID,
    validateQueryUsername,
    validateQueryVisitorUsername,
    validateQueryFullNames,
    validateQueryPostID,
    validateQueryPostIDList,
    validateQueryProjectID,
    validateQueryShouldDeletePosts,

    validateQueryImageKey,
    validateQueryIncludePostText,
    validateQueryProjectID,
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
    validateBodyProjectID,
    validateBodyProjectData,
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