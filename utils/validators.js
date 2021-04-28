const { body, query, validationResult } = require('express-validator');
const { BadRequestError } = require('./errors');


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
    throw new BadRequestError(extractedParams
        .toString()
        .concat(extractedParams > 1 ? " are missing" : " is missing"));
}

const validateQueryUsername = [query("username").exists()];
const validateQueryFullNames = [query("firstName").exists(), query("lastName").exists()];
const validateBodyFullNames = [body("firstName").exists(), body("lastName").exists()];
const validateBodyUsername = [body("username").exists()];
const validateBodyPursuits = [body("pursuits").exists()];
const validateBodyIndexUserID = [body('indexUserID').exists()];
const validateBodyText = [body('text').exists()];
const validateBodyPursuit = [body('pursuit').exists()];
const validateBodyBio = [body('body').exists()];
const validateBodyPrivate = [body('private').exists()];

module.exports = {
    doesValidationErrorExist,
    validateQueryUsername,
    validateQueryFullNames,
    validateBodyFullNames,
    validateBodyUsername,
    validateBodyBio,
    validateBodyPrivate,
    validateBodyPursuits,
    validateBodyIndexUserID,
    validateBodyText,
    validateBodyPursuit
}