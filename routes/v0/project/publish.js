const { findByIDAndUpdate } = require("../../../data-access/dal");
const ModelConstants = require('../../../models/constants');

module.exports = (req, res, next) => {
    const projectID = req.body.projectID;
    return findByIDAndUpdate(ModelConstants.PROJECT, projectID, { status: 'PUBLISHED' })
        .then(results => {
            console.log(results);
            return res.status(200).send();
        })
}