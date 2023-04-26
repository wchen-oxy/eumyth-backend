const express = require('express');
const { findByID, find } = require('../../../data-access/dal');
const router = express.Router();
const ModelConstants = require('../../../models/constants');

const {
    PARAM_CONSTANTS,
    buildQueryValidationChain,
    doesValidationErrorExist,
} = require('../../../shared/validators/validators');

router
    .route('/single').get(
        buildQueryValidationChain(PARAM_CONSTANTS.PROJECT_PREVIEW_ID),
        doesValidationErrorExist,
        (req, res, next) => {
            const projectPreviewID = req.query.projectPreviewID;
            return findByID(ModelConstants.PROJECT_PREVIEW_WITH_ID, projectPreviewID)
                .then((result) => res.status(200).json(result))
                .catch(next);
        }
    );

router
    .route('/shared-parent')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.PARENT_PROJECT_ID,
            PARAM_CONSTANTS.STATUS,
            PARAM_CONSTANTS.EXCLUDED
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const parentProjectPreviewID = req.query.parentProjectID;
            const status = req.query.status;
            const excluded = req.query.excluded;
            console.log(excluded)
            return find(ModelConstants.PROJECT_PREVIEW_WITH_ID,
                { status, parent_project_id: parentProjectPreviewID, project_id: { $nin: excluded } })
                .then((result) => res.status(200).json(result))
                .catch(next);
        }
    )

module.exports = router;
