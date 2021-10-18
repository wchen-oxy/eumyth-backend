const express = require('express');
const { retrieveUserPreviewByUsername } = require('../../data_access/dal');
const router = express.Router();
const { validateQueryUsername } = require('../../utils/validators/validators');

router.route("/id").get(
    validateQueryUsername,
    (req, res, next) => {
        const username = req.query.username;
        return retrieveUserPreviewByUsername(username)
            .then(result => {
                return res.status(200).json({ userPreviewID: result._id });
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            })
    })

module.exports = router;