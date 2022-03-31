const { findByIDAndUpdate } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');

module.exports = (req, res, next) => {
    let promisedUpdate = null;
    const updates = {};
    const previewUpdates = {};
    req.file ? updates.cover_photo_key = req.file.key : null;
    req.body.title ? updates.title = req.body.title : null;
    req.body.overview ? updates.overview = req.body.overview : null;
    req.body.pursuit ? updates.pursuit = req.body.pursuit : null;
    req.body.startDate ? updates.start_date = req.body.startDate : null;
    req.body.endDate ? updates.end_date = req.body.endDate : null;
    req.body.minDuration ? updates.min_duration = req.body.minDuration : null;
    req.body.selectedPosts ? updates.post_ids = req.body.selectedPosts : null;
    if (req.body.labels) {
        updates.labels = req.body.labels;
        previewUpdates.labels = req.body.labels;
    }

    if (req.body.status) {
        updates.status = req.body.status;
        previewUpdates.status = req.body.status;
    }

    if (req.body.remix) {
        updates.remix = req.body.remix;
        previewUpdates.remix = req.body.remix;
    }

    if (req.body.isForked) {
        promisedUpdate = Promise.all([
            findByIDAndUpdate(
                ModelConstants.PROJECT,
                req.body.projectID,
                updates),
            findByIDAndUpdate(
                ModelConstants.PROJECT_PREVIEW_WITH_ID,
                req.body.projectPreviewID,
                previewUpdates
            )
        ]);
    }
    else {
        promisedUpdate = findByIDAndUpdate(
            ModelConstants.PROJECT,
            req.body.projectID,
            updates);
    }

    return promisedUpdate
        .then((result) => {
            return res.status(200).send();
        });
}
