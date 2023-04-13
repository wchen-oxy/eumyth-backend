const searchServices = require('./services');

module.exports = (req, res, next) => {
    const pursuit = req.query.pursuit;
    const labels = req.query.labels;
    console.log(req.query);
    return searchServices.searchRelated(pursuit, labels)
        .then(results => {
            res.locals.projects = results;
            next();
        })
        .catch(next);
}