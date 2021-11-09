var router = require('express').Router();
let { NoContentError } = require("../../../shared/errors");
let { NO_USER_FOUND } = require("../../../shared/utils/messages");
const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    doesValidationErrorExist,
} = require("../../../shared/validators/validators");
const { findByID } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');

router.route('/all-posts')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.PROFILE_ID
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const profileID = req.query.profileID;
            return findByID(ModelConstants.USER, profileID)
                .then(result => {
                    if (!result) throw new NoContentError(NO_USER_FOUND);
                    const posts = result.pursuits[0].posts ? result.pursuits[0].posts : [];
                    return res.status(200).json(posts)
                })
                .catch(next);
        });

module.exports = router;

