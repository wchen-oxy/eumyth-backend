const ModelConstants = require('../../../models/constants');

const {
    findByID,
} = require('../../../data-access/dal');
module.exports = (req, res, next) => {
    console.log(req.body);
    console.log('fadsf');
    const parentProjectID = req.body.parentProjectID ? req.body.parentProjectID : null;
    if (parentProjectID) {
        findByID(ModelConstants.PROJECT, parentProjectID).then(
            result => {
                res.locals.parentProject = result;

            }
        ).catch(next)
    }
    else {
        return next();
    }
}