var router = require('express').Router();
let { NoContentError } = require("../../utils/errors");
let { NO_USER_FOUND } = require("../../utils/shared/messages");
const { doesValidationErrorExist, validateQueryProfileID } = require("../../utils/validators/validators");
const { retrieveCompleteUserByID } = require('../../data_access/dal');

router.route('/all-posts')
    .get(
        validateQueryProfileID,
        doesValidationErrorExist, (req, res, next) => {
            const profileID = req.query.profileID;
            return retrieveCompleteUserByID(profileID)
                .then(result => {
                    if (!result) throw new NoContentError(NO_USER_FOUND);
                    const posts = result.pursuits[0].posts ? result.pursuits[0].posts : [];
                    return res.status(200).json(posts)
                })
                .catch(next);
        });

module.exports = router;

