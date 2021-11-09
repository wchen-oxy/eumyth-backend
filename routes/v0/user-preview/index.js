const express = require('express');
const { findOne } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const router = express.Router();
const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    doesValidationErrorExist
} = require('../../../shared/validators/validators');

router.route("/id").get(
    buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
        const username = req.query.username;
        return findOne(ModelConstants.USER_PREVIEW, { username: username })
            .then(result => {
                return res.status(200).json({ userPreviewID: result._id });
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            })
    })

module.exports = router;