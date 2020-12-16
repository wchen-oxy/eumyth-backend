var express = require('express');
const { returnUserImageURL } = require('../../constants/aws');
var router = express.Router();
let IndexUser = require('../../models/index.user.model');
const AWS = require('aws-sdk');
const AwsConstants = require('../../constants/aws');

const s3 = new AWS.S3({
    accessKeyId: AwsConstants.ID,
    secretAccessKey: AwsConstants.SECRET
});

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
                        smallDisplayPhoto: user.tiny_cropped_display_photo_key,
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
                console.log(JSON.parse(draft).blocks);
                for (const block of JSON.parse(draft).blocks) {
                    if (Object.keys(block.data).length) {
                        const url = block.data.url;
                        console.log(block.type);
                        // console.log(block.data.type);
                        if (block.type !== 'unstyled') currentURLs.push(url);
                    }
                }
                for (const url of previousURLs) {
                    if (!currentURLs.includes(url)) {
                        console.log(url);
                        const path = new URL(url).pathname;
                        const key = path[0] == '/' ? path.substr(1) : path;
                        console.log(key);
                        toDeleteURLs.push({ Key: key }
                        );
                    }
                }
                console.log(currentURLs);
                console.log("\n");
                indexUser.draft.text = draft;
                // console.log(indexUser.draft.links);

                indexUser.draft.links = currentURLs;
                // console.log(indexUser.draft.links);
                console.log(toDeleteURLs);
                if (toDeleteURLs.length > 0)
                    return Promise.all(
                        [indexUser.save((err) => {
                            if (err) {
                                console.error('ERROR: ' + err);
                                res.status(500).json(err);
                            }
                        }),
                        s3.deleteObjects({
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
