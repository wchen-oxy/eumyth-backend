var express = require('express');
var router = express.Router();
let IndexUser = require('../../models/index.user.model');
const AwsConstants = require('../../constants/aws');

router.route('/').get((req, res) => {
    const username = req.query.username;
    return IndexUser.Model.findOne({ username: username })
        .then((user) => {
            if (!user) {
                return res.status(204);
            }
            if (!user.draft)
                return res.status(200).send(
                    {
                        smallDisplayPhoto: user.small_cropped_display_photo_key,
                        draft: null
                    }
                );

            return res.status(200).send({
                smallDisplayPhoto: user.tiny_cropped_display_photo_key,
                draft: user.draft.text ? user.draft.text : null
            });
        })
        .catch(err => console.log('ERROR' + err));
})
    .put((req, res) => {
        const username = req.body.username;
        const draft = req.body.draft;
        IndexUser.Model.findOne({ username: username },
            (err, indexUserProfile) => {
                if (err) {
                    console.log(err);
                    res.status(500).json("Error: " + err)
                }
            }
        ).then(
            indexUser => {
                let toDeleteURLs = [];
                let currentURLs = [];
                const previousURLs = indexUser.draft.links;
                for (const block of JSON.parse(draft).blocks) {
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
                        toDeleteURLs.push({ Key: key }
                        );
                    }
                }
                indexUser.draft.text = draft;
                indexUser.draft.links = currentURLs;
                if (toDeleteURLs.length > 0)
                    return Promise.all(
                        [indexUser.save((err) => {
                            if (err) {
                                console.error('ERROR: ' + err);
                                res.status(500).json(err);
                            }
                        }),
                        AwsConstants.S3_INTERFACE.deleteObjects({
                            Bucket: AwsConstants.BUCKET_NAME,
                            Delete: {
                                Objects: toDeleteURLs
                            }
                        }, function (err, data) {
                            if (err) {
                                console.log(err, err.stack);
                            }
                            else { console.log("Success", data); }
                        }).promise()
                        ]);
                else {
                    return indexUser.save((err) => {
                        if (err) {
                            console.error('ERROR: ' + err);
                            res.status(500).json(err);
                        }
                    });
                }
            }
        )
            .then(() => res.sendStatus(200)).catch(err => console.log(err));
    })
    .delete((req, res) => {
        const username = req.headers.username;
        IndexUser.Model.findOne({ username: username },
            (err, indexUserProfile) => {
                if (err) {
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

// router.route('/title').put((req, res) => {
//     const username = req.body.username;
//     const title = req.body.title;
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
//                 indexUser.draft.title = title;
//                 return indexUser.save((err) => {
//                     if (err) {
//                         console.error('ERROR: ' + err);
//                         res.status(500).json(err);
//                     }
//                 });

//             }
//         ).then(() => res.sendStatus(201)).catch(err => console.log(err));

// }
// )

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
