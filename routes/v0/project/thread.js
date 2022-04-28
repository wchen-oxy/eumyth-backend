const { findOne, findByID } = require("../../../data-access/dal");

module.exports = (req, res, next) => {
    const oldProjectPreviewID = req.body.projectPreviewID;
    const newProjectID = req.body.projectID;
    const postID = req.body.postID;

    return Promise
        .all([
            findOne(ModelConstants.PROJECT,
                { project_preview_id: oldProjectPreviewID }),
            findByID(ModelConstants.PROJECT, newProjectID)
        ])
        .then((results) => {
            const oldProject = results[0]._id.toString() === oldProjectID
                ? results[0] : results[1];
            const newProject = results[0]._id.toString() === newProjectID
                ? results[0] : results[1];
            const index = oldProject.post_ids.findIndex((item) => item === postID);
            oldProject.post_ids.splice(index, 1);
            newProject.post_ids.unshift(postID);
            return Promise.all([oldProject.save(), newProject.save()]);
        })
        .then(results =>
            res.status(200).send()
        )
        .catch(next);
}