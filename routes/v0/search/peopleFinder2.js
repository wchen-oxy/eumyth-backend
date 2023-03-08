const searchServices = require('./services');

module.exports = (req, res, next) => {
    console.log(req.query);
    const distance = parseInt(req.query.distance);
    const userPreviewIDList = req.query.userPreviewIDList ? req.query.userPreviewIDList : [];
    const pursuits = req.query.pursuits;
    const lat = req.query.latitude;
    const long = req.query.longitude;
    const coordinates = [parseInt(long), parseInt(lat)];
    let returnedPursuits = [];
    for (const pursuit of pursuits) {
        const formatted = JSON.parse(pursuit);
        returnedPursuits.push(
            searchServices
                .searchGeoSpatialByBoundedPursuit(
                    userPreviewIDList,
                    coordinates,
                    distance,
                    formatted.name,
                    formatted.experience
                )
        )
    }
    return Promise.all(returnedPursuits)
        .then(results => {
            res.locals.pursuits = results;
            next();
        })

        .catch(next);
}