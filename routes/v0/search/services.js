const GeoPoint = require('geopoint');
const UserPreview = require('../../../models/user.preview.model');
const ModelConstants = require('../../../models/constants');
const mongoose = require('mongoose');
const selectModel = require('../../../models/modelServices');
const {
    findOne,
    findByID,
    findManyByID,
} = require('../../../data-access/dal');


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

    })
        .lean();
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
    }).lean();
}

const appendPostData = (users, pursuit) => {
    let mapping = {}
    let postIDs = [];
    for (const user of users) {
        mapping[user.parent_user_id] = [];
        postIDs = postIDs.concat(
            user.pursuits[0].posts
                .slice(0, 3)
                .map(item => item.content_id));
    }
    return findManyByID(
        ModelConstants.POST,
        postIDs,
        false)
        .lean()
        .then(results => {
            for (const result of results) {
                const temp = mapping[result.author_id];
                temp.push(result);
                mapping[result.author_id] = temp;
            }
            for (let i = 0; i < users.length; i++) {
                users[i].pursuits[0].loaded = mapping[users[i].parent_user_id];
            }
            return users;
        })
}

exports.getBounds = getBounds;
exports.searchByBounds = searchByBounds;
exports.searchByBoundedPursuits = searchByBoundedPursuits;
exports.appendPostData = appendPostData;
