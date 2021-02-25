const express = require('express');
const router = express.Router();
const UserPreview = require('../../models/user.preview.model');

router.route("/id").get((req, res) => {
    const username = req.query.username;
    return UserPreview.Model
        .findOne({ username: username })
        .then(result => {
            return res.status(200).json({ userPreviewId: result._id });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json({ error: error });
        })
})

module.exports = router;