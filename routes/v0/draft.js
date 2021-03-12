var express = require('express');
var router = express.Router();
let IndexUser = require('../../models/index.user.model');
const AWSConstants = require('../../constants/aws');
const Helper = require('../../constants/helper');

router.route('/')
    .get((req, res) => {
        const username = req.query.username;

        return IndexUser.Model
            .findOne({ username: username }, Helper.resultCallback)
            .then((user) => {
                if (!user) {
                    const findUserError = "No user found with that username.";
                    console.log(findUserError);
                    return res.status(204).json({ error: findUserError });
                }
                if (!user.draft)
                    return res.status(200).send({
                        smallDisplayPhoto: user.small_cropped_display_photo_key,
                        draft: null
                    });

                return res.status(200).send({
                    smallDisplayPhoto: user.tiny_cropped_display_photo_key,
                    draft: user.draft.text ? user.draft.text : null
                });
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            });
    })
    .put((req, res) => {
        const username = req.body.username;
        const draft = req.body.draft;
        const draftTitle = req.body.draftTitle;
        const parsedDraft = JSON.parse(draft).blocks;

        return IndexUser.Model
            .findOne({ username: username }, Helper.resultCallback)
            .then(indexUser => {
                const previousURLs = indexUser.draft.links;
                let toDeleteURLs = [];
                let currentURLs = [];
                for (const block of parsedDraft) {
                    if (Object.keys(block.data).length) {
                        const url = block.data.url;
                        if (block.type !== 'unstyled') currentURLs.push(url);
                    }
                }
                for (const url of previousURLs) {
                    if (!currentURLs.includes(url)) {
                        console.log(url);
                        const path = new URL(url).pathname;
                        const key = path[0] == '/' ? path.substr(1) : path;
                        toDeleteURLs.push({ Key: key });
                    }
                }
                indexUser.draft.text = draft;
                indexUser.draft.links = currentURLs;
                if (draftTitle) { indexUser.draft.title = draftTitle; }
                if (toDeleteURLs.length > 0)
                    return Promise.all(
                        [indexUser.save(),
                        AWSConstants.S3_INTERFACE.deleteObjects({
                            Bucket: AWSConstants.BUCKET_NAME,
                            Delete: {
                                Objects: toDeleteURLs
                            }
                        }, Helper.resultCallback)
                        ]);
                else {
                    return indexUser.save();
                }
            })
            .then(() => res.sendStatus(200))
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            });
    })
    .delete((req, res) => {
        const username = req.headers.username;

        return IndexUser.Model
            .findOne({ username: username }, Helper.resultCallback)
            .then(indexUser => {
                indexUser.draft = null;
                indexuser.save();
            })
            .then(() => res.sendStatus(201))
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            });

    })

router.route('/title')
    .put((req, res) => {
        const username = req.body.username;
        const draftTitle = req.body.draftTitle;
        return IndexUser.Model.findOne({ username: username })
            .then(
                (indexUser) => {
                    indexUser.draft.title = draftTitle;
                    return indexUser.save();
                }
            )
            .then(() => res.sendStatus(201))
            .catch(err => {
                console.log(err);
                return res.status(500).send();
            });
    })

// router.route('/desc').put((req, res) => {
//     const username = req.body.username;
//     const desc = req.body.desc;
//     IndexUser.Model.findOne({ username: username },
//         (err, indexUserProfile) => {
//             if (err) {
//                 console.log(err);
//                 res.status(500).json("Error: " + err)
//             }
//         }
//     )
//         .then(
//             (indexUser) => {
//                 indexUser.draft.desc = req.body.desc;
//                 return indexUser.save((err) => {
//                     if (err) {
//                         console.error('ERROR: ' + err);
//                         res.status(500).json(err);
//                     }
//                 });
//             }
//         ).then(
//             () => res.sendStatus(201)).catch(err => console.log(err)
//             );
// }
// );

module.exports = router;
