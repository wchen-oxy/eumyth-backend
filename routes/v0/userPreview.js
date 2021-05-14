const express = require('express');
const { retrieveUserPreviewByUsername } = require('../../data_access/dal');
const router = express.Router();
const UserPreview = require('../../models/user.preview.model');
const { validateQueryUsername } = require('../../utils/validators');

router.route("/id").get(
    validateQueryUsername,
    (req, res, next) => {
        const username = req.query.username;
        return retrieveUserPreviewByUsername(username)
            .then(result => {
                return res.status(200).json({ userPreviewId: result._id });
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            })
    })

module.exports = router;