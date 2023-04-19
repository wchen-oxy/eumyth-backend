const searchServices = require('./services');

module.exports = (req, res, next) => {
    const pursuit = req.query.pursuit;
    const labels = req.query.labels ? req.query.labels : [];
    const excluded = req.query.excluded;
    console.log(req.query);
    const sendResults = results => {
        res.locals.projects = results;
        next();
    }
    if (labels.length === 0) {
        return searchServices
            .searchRelatedNoKeys(pursuit, excluded)
            .then(sendResults);
    }

    return searchServices.searchRelatedWithKeys(pursuit, labels, excluded)
        .then(results => {
            if (results.length === 0) return searchRelatedNoKeys(pursuit, excluded);
            else {
                return sendResults(results);
            }
        })
        .catch(next);
}