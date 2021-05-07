const express = require('express');
const router = express.Router();
const UserPreview = require('../../models/user.preview.model');
const { validateQueryUsername } = require('../../utils/validators');

router.route("/id").get(
    validateQueryUsername,
    (req, res) => {
    const username = req.query.username;
    console.log(username);
    return UserPreview.Model
        .findOne({ username: username })
        .then(result => {
            console.log(result);
            return res.status(200).json({ userPreviewId: result._id });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json({ error: error });
        })
})

module.exports = router;