var express = require('express');
var router = express.Router();
let IndexUser = require('../../models/index.user.model');

router.route('/').get((req, res) => {
    const username = req.query.username;
    return IndexUser.Model.findOne({ username: username })
        .then((user) => {
            if (user.draft === undefined) {
                return res.status(204);
            }
            return res.status(200).send({
                smallDisplayPhoto: user.small_cropped_display_photo,
                draft: user.draft
            });
        })
        .catch(err => console.log('ERROR' + err));
})
    .put((req, res) => {
        const username = req.body.username;
        const draft = req.body.draft;
        console.log(draft);
        console.log(typeof (draft));

        IndexUser.Model.findOne({ username: username },
            (err, indexUserProfile) => {
                if (err) {
                    console.log(err);
                    res.status(500).json("Error: " + err)
                }
            }
        ).then(
            indexUser => {
                indexUser.draft = draft;
                indexUser.save((err) => {
                    if (err) {
                        console.error('ERROR: ' + err);
                        res.status(500).json(err);
                    }
                });
            }
        )
            .then(() => res.sendStatus(200)).catch(err => console.log(err));
    })
    .delete((req, res) => {
        const username = req.headers.username;
        IndexUser.Model.findOne({ username: username },
            (err, indexUserProfile) => {
                if (err) {
                    // console.log("Error");
                    console.log(err);
                    res.status(500).json("Error: " + err)
                }
            }
        ).then(
            indexUser => {
                indexUser.draft = null;
                indexuser.save((err) => {
                    if (err) {
                        console.error('ERROR: ' + err);
                        res.status(500).json(err);
                    }
                });
            }
        )
            .then(() => res.sendStatus(201)).catch(err => console.log(err));

    })

router.route('/title').put((req, res) => {
    const username = req.body.username;
    const title = req.body.title;
    IndexUser.Model.findOne({ username: username },
        (err, indexUserProfile) => {
            if (err) {
                console.log(err);
                res.status(500).json("Error: " + err)
            }
        }
    )
        .then(
            (indexUser) => {
                indexUser.draft.title = req.body.title;
                return indexUser.save((err) => {
                    if (err) {
                        console.error('ERROR: ' + err);
                        res.status(500).json(err);
                    }
                });

            }
        ).then(() => res.sendStatus(201)).catch(err => console.log(err));

}
)

router.route('/desc').put((req, res) => {
    const username = req.body.username;
    const title = req.body.title;
    IndexUser.Model.findOne({ username: username },
        (err, indexUserProfile) => {
            if (err) {
                console.log(err);
                res.status(500).json("Error: " + err)
            }
        }
    )
        .then(
            (indexUser) => {
                indexUser.draft.title = req.body.title;
                return indexUser.save((err) => {
                    if (err) {
                        console.error('ERROR: ' + err);
                        res.status(500).json(err);
                    }
                });
            }
        ).then(() => res.sendStatus(201)).catch(err => console.log(err));

}
)

module.exports = router;
