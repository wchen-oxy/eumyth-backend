const searchServices = require('./services');

module.exports = (req, res, next) => {
    const distance = req.query.distance;
    const userPreviewIDList = req.query.userPreviewIDList ? req.query.userPreviewIDList : [];
    const pursuits = req.query.pursuit;
    const lat = req.query.latitude;
    const long = req.query.longitude;
    const limits = searchServices.getBounds(distance, { lat, long });
    return searchServices
        .searchByBoundedPursuits(userPreviewIDList, limits, pursuits)
        .then(results => {
            res.locals.users = results.map(value => {
                value['distance'] = searchServices
                    .getDistance(
                        lat,
                        value.coordinates.latitude,
                        long,
                        value.coordinates.longitude
                    );
                return value;
            })
            return next();
        });
}