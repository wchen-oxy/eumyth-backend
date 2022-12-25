const router = require('express').Router();
const { findOne, findByID } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    buildBodyValidationChain,
    doesValidationErrorExist
} = require('../../../shared/validators/validators');

router.route('/').get(
    (req, res, next) => {
        const indexUserID = req.query.indexUserID ? req.query.indexUserID : null;
        const userRelationID = req.query.userRelationID ? req.query.userRelationID : null;
        const id = req.query.id ? req.query.id : null;
        console.log(req.query);
        let userPreview = null;
        if (id) {
            userPreview = findByID(ModelConstants.USER_PREVIEW, id);
        }
        if (indexUserID) {
            userPreview = findOne(ModelConstants.USER_PREVIEW, { parent_index_user_id: indexUserID })

        }
        else if (userRelationID) {
            userPreview = findOne(ModelConstants.USER_PREVIEW, { user_relation_id: userRelationID })

        }

        if (!userPreview) return res.status(500);
        else {
            userPreview.then(result => {
                return res.status(201).json(result)
            })
        }

    }
)

router.route('/id').get(
    buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
        const username = req.query.username;
        return findOne(ModelConstants.USER_PREVIEW, { username: username })
            .then(result => {
                return res.status(200).json({ userPreviewID: result._id });
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: error });
            })
    })

router.route('/location')
    .get(buildQueryValidationChain(PARAM_CONSTANTS.USER_PREVIEW_ID),
        doesValidationErrorExist,
        (req, res, next) => {
            const userPreviewID = req.query.userPreviewID;
            return findByID(ModelConstants.USER_PREVIEW, userPreviewID)
                .then(result => {
                    const val = result.coordinates;
                    if (!val.latitude && !val.longitude) {
                        return res.status(204).send();
                    }
                    else {
                        console.log(result.coordinates);
                        return res.status(200).json({ coordinates: result.coordinates });
                    }
                })
                .catch(next);
        })
    .put(
        buildBodyValidationChain(
            PARAM_CONSTANTS.LATITUDE,
            PARAM_CONSTANTS.LONGITUDE,
            PARAM_CONSTANTS.USER_PREVIEW_ID
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const latitude = req.body.latitude;
            const longitude = req.body.longitude;
            const userPreviewID = req.body.userPreviewID;

            return findByID(ModelConstants.USER_PREVIEW, userPreviewID)
                .then(result => {
                    result.coordinates.latitude = latitude;
                    result.coordinates.longitude = longitude;
                    return result.save();
                })
                .then(() => res.status(200).send())
        }
    )

module.exports = router;