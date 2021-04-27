const { query, validationResult } = require('express-validator');
const { BadRequestError } = require('./errors');

const USERNAME = "username";

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
        console.log("no error found");
        return next();
    }

    errors.array().map(err => extractedParams.push(err.param));
    throw new BadRequestError(extractedParams
        .toString()
        .concat(extractedParams > 1 ? " are missing" : " is missing"));
}

const validateQueryUsername = [query(USERNAME).exists()];

module.exports = {
    doesValidationErrorExist,
    validateQueryUsername,

}