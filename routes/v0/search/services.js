const GeoPoint = require('geopoint');
const UserPreview = require('../../../models/user.preview.model');
const mongoose = require('mongoose');

const getBounds = (distance, crd) => {
    const geopoint = new GeoPoint(parseFloat(crd.lat), parseFloat(crd.long));
    return geopoint.boundingCoordinates(parseInt(distance));
}

const getBoundOperator = (limits) => {
    return ({
        $and: [
            { 'coordinates.latitude': { $gte: limits[0]._degLat } },
            { 'coordinates.longitude': { $gte: limits[0]._degLon } },
            { 'coordinates.latitude': { $lte: limits[1]._degLat } },
            { 'coordinates.longitude': { $lte: limits[1]._degLon } }
        ]
    })
}

//includes a list of ids to prevent duplicates
const searchByBounds = (IDs, limits) => {
    const list = IDs.map(ID => mongoose.Types.ObjectId(ID));
    const _bounds = getBoundOperator(limits);
    return UserPreview.Model.find({
        _id: { $nin: list },
        ..._bounds,

    });
}

const searchByBoundedPursuits = (IDs, limits, pursuits) => {
    const list = IDs.map(ID => mongoose.Types.ObjectId(ID));
    const _bounds = getBoundOperator(limits);
    return UserPreview.Model.find({
        _id: { $nin: list },
        pursuits: {
            $elemMatch: {
                name: { $in: pursuits }
            }
        },
        ..._bounds,
    })
}

exports.getBounds = getBounds;
exports.searchByBounds = searchByBounds;
exports.searchByBoundedPursuits = searchByBoundedPursuits;
