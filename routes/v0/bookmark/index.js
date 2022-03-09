const express = require('express');
const router = express.Router();
const {
    PARAM_CONSTANTS,
    buildBodyValidationChain,
    doesValidationErrorExist,
} = require('../../../shared/validators/validators');
const {
    findByID,
    deleteOne
} = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');

router.route('/bookmark')
    .put(
        buildBodyValidationChain(
            PARAM_CONSTANTS.BOOKMARK_STATE,
            PARAM_CONSTANTS.CONTENT_ID,
            PARAM_CONSTANTS.CONTENT_TYPE,
            PARAM_CONSTANTS.USER_PREVIEW_ID,
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const contentID = req.body.contentID;
            const contentType = req.body.contentType;
            const userPreviewID = req.body.userPreviewID;
            const bookmarkState = req.body.bookmarkState;
            if (bookmarkState)
                return findByID(ModelConstants.PROJECT, contentID)
                    .then(result => {
                        if (!result) throw new Error("No Content");
                        result.bookmarks.push(userPreviewID);
                        const newBookmark = (
                            selectModel(ModelConstants.BOOKMARK)
                                ({
                                    user_preview_id: userPreviewID,
                                    content_type: contentType,
                                    content_id: contentID,
                                }));
                        return Promise.all([
                            result.save(),
                            newBookmark.save()
                        ])
                    })
                    .then(results => res.status(201).send())
                    .catch(next);
            else {
                return findByID(ModelConstants.PROJECT, contentID)
                    .then(result => {
                        if (!result) throw new Error("No Content");
                        result.bookmarks = result.bookmarks
                            .filter(item => item.toString() !== userPreviewID);
                        return Promise
                            .all([
                                result.save(),
                                deleteOne(
                                    ModelConstants.BOOKMARK,
                                    { content_id: contentID, user_preview_id: userPreviewID }
                                )
                            ])
                    })
                    .then(results => res.status(201).send())
                    .catch(next)
            }
        }
    );


module.exports = router;