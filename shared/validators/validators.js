const { body, query, validationResult } = require('express-validator');
const { BadRequestError } = require('../errors');

const PARAM_CONSTANTS = {
    ACTION: 'action',
    ANCESTORS: 'ancestors',
    BIO: 'bio',
    BOOKMARK_STATE: 'bookmarkState',
    COMMENT: 'comment',
    COMMENT_ID: 'commentID',
    COORDINATES: 'coordinates',
    CURRENT_USERNAME: 'currentUsername',
    CURRENT_USER_RELATION_ID: 'currentUserRelationID',
    DISPLAY_PHOTO: 'displayPhoto',
    DISTANCE: 'distance',
    DIFFICULTY: 'difficulty',
    DRAFT: 'draft',
    DRAFT_TITLE: 'draftTitle',
    FIRST_NAME: 'firstName',
    ID: 'ID',
    IMAGE_KEY: 'imageKey',
    INCLUDE_POST_TEXT: 'includePostText',
    INDEX_USER_ID: 'indexUserID',
    IS_PAGINATED: 'isPaginated',
    IS_PRIVATE: 'isPrivate',

    KEYS: 'keys',
    LAST_NAME: 'lastName',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    LOCATION: 'location',
    POST_ID: 'postID',
    POST_ID_LIST: 'postIDList',
    POST_PRIVACY: 'postPrivacyType',
    POST_TYPE: 'postType',
    PROFILE_ID: 'profileID',
    PROJECT_DATA: 'projectData',
    PROFILE_PREVIEW_ID: 'profilePreviewID',
    PROGRESSION: 'progression',
    PROJECT_ID: 'projectID',
    PROJECT_ID_LIST: 'projectIDList',
    PURSUIT: 'pursuit',
    PURSUIT_ARRAY: 'pursuitArray',
    QUANTITY: 'quantity',
    REQUEST_QUANTITY: 'requestQuantity',
    REMOVE_COVER_PHOTO: 'removeCoverPhoto',
    ROOT_COMMENT_ID_ARRAY: 'rootCommentIDArray',
    SEARCH_MODE: 'searchMode',
    SELECTED_POSTS: 'selectedPosts',
    SHOULD_DELETE_POSTS: 'shouldDeletePosts',
    SHOULD_COPY_POSTS: 'shouldCopyPosts',
    SUBMITTING_INDEX_USER_ID: 'submittingIndexUserID',
    TARGET_USERNAME: 'targetUsername',
    TARGET_USER_PREVIEW_ID: 'targetUserPreviewID',
    TARGET_USER_RELATION_ID: 'targetUserRelationID',
    TEXT: 'text',
    TEXT_ONLY: 'textOnly',
    TITLE: 'title',
    USER_ID: 'userID',
    USER_PREVIEW_ID: 'userPreviewID',
    USER_PREVIEW_ID_LIST: 'userPreviewIDList',
    USER_RELATION_ID: 'userRelationID',
    VISITOR_USERNAME: 'visitorUsername',
    VISITOR_USER_PREVIEW_ID: 'visitorUserPreviewID',
    VISITOR_USER_RELATION_ID: 'visitorUserRelationID',
    USERNAME: 'username',
    VIEWING_MODE: 'viewingMode',
    VOTE_VALUE: 'voteValue',

    CROPPED_IMAGE: 'croppedImage',
    SMALL_CROPPED_IMAGE: 'smallCroppedImage',
    TINY_CROPPED_IMAGE: 'tinyCroppedImage',
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

const validateQueryPrimitiveExistence = (param) => query(param).default(null);
const validateBodyPrimitiveExistence = (param) => body(param).default(null);
const validateQueryArrayExistence = (param) => query(param).isArray();
const validateBodyArrayExistence = (param) => body(param).isArray();
const validateBodyCompressedImageSet = [
    body(PARAM_CONSTANTS.CROPPED_IMAGE).custom(imageFileWrapper),
    body(PARAM_CONSTANTS.SMALL_CROPPED_IMAGE).custom(imageFileWrapper),
    body(PARAM_CONSTANTS.TINY_CROPPED_IMAGE).custom(imageFileWrapper)
];



exports.PARAM_CONSTANTS = PARAM_CONSTANTS;
exports.doesValidationErrorExist = doesValidationErrorExist;
exports.buildQueryValidationChain = buildQueryValidationChain;
exports.buildBodyValidationChain = buildBodyValidationChain;
exports.validateQueryPrimitiveExistence = validateQueryPrimitiveExistence;
exports.validateBodyPrimitiveExistence = validateBodyPrimitiveExistence;
exports.validateQueryArrayExistence = validateQueryArrayExistence;
exports.validateBodyArrayExistence = validateBodyArrayExistence;
