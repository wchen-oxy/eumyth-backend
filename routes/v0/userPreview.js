const express = require('express');
const router = express.Router();
const UserPreview = require('../../models/user.preview.model');

router.route("/id").get((req, res) => {
    const username = req.query.username;
    return UserPreview.Model
        .findOne({ username: username })
        .then(result => {
            res.status(200).json({ userPreviewId: result._id });

        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        })
})

module.exports = router;