const express = require('express');
const router = express.Router();
const AWSConstants = require('../../../shared/utils/aws');
const Helper = require('../../../shared/utils/helper');
const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    buildBodyValidationChain,
    doesValidationErrorExist,
}
    = require('../../../shared/validators/validators');
const { retrieveIndexUserByUsername } = require('../../../data-access/dal');

router.route('/')
    .get(
        buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
        doesValidationErrorExist,
        (req, res, next) => {
            const username = req.query.username;
            return retrieveIndexUserByUsername(username)
                .then((user) => {
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
                .catch(next);
        })
    .put(
        buildBodyValidationChain(
            PARAM_CONSTANTS.USERNAME,
            PARAM_CONSTANTS.DRAFT),

        doesValidationErrorExist,
        (req, res, next) => {
            const username = req.body.username;
            const draft = req.body.draft;
            const draftTitle = req.body.draftTitle ? req.body.draftTitle : null;
            const parsedDraft = JSON.parse(draft).blocks;
            return retrieveIndexUserByUsername(username)
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
                .catch(next);
        });

router.route('/title')
    .put(
        buildBodyValidationChain(
            PARAM_CONSTANTS.USERNAME,
            PARAM_CONSTANTS.DRAFT_TITLE
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const username = req.body.username;
            const draftTitle = req.body.draftTitle;
            return retrieveIndexUserByUsername(username)
                .then(
                    (indexUser) => {
                        indexUser.draft.title = draftTitle;
                        return indexUser.save();
                    }
                )
                .then(() => res.sendStatus(201))
                .catch(next);
        })


module.exports = router;
