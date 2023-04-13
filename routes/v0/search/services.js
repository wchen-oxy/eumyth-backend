const GeoPoint = require('geopoint');
const selectModel = require('../../../models/modelServices');
const ModelConstants = require('../../../models/constants');
const { BEGINNER, FAMILIAR, EXPERIENCED, EXPERT, EXACT, DIFFERENT } = require('../../../shared/utils/flags');
const mongoose = require('mongoose');
const {
    find,
    findOne,
    findByID,
    findManyByID,
    limitFind,
} = require('../../../data-access/dal');

// const _sortByPursuit = (pursuits, names, beginner, familiar, experienced, expert) => {
//     for (let i = 1; i < pursuits.length; i++){
//         if ((names.includes(pursuits[i].name)) ){
//             switch(pursuits[i].experience_level) {
//                 case(BEGINNER):

//                 case(FAMILIAR):
//                 case(EXPERIENCED):
//                 case(EXPERT):
//             }
//         }
//     }
// }

const _sortByDate = (a, b) => {
    const aDate = new Date(a.updatedAt);
    const bDate = new Date(b.updatedAt);

    if (aDate.updatedAt < bDate.updatedAt) return -1;
    else if (aDate.updatedAt > bDate.updatedAt) return 1;
    else {
        return 0;
    }
};
const getDistance = (lat1, lat2, lon1, lon2) => {
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    //use 6371 for km
    let r = 3956;

    // calculate the result
    return (c * r);
}


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
    return selectModel(ModelConstants.USER_PREVIEW).find({
        _id: { $nin: list },
        ..._bounds,

    })
        .lean();
}

const searchByBoundedPursuits = (IDs, limits, pursuits) => {
    const list = IDs.map(ID => mongoose.Types.ObjectId(ID));
    const _bounds = getBoundOperator(limits);
    return selectModel(ModelConstants.USER_PREVIEW).find({
        _id: { $nin: list },
        pursuits: {
            $elemMatch: {
                name: { $in: pursuits }
            }
        },
        ..._bounds,
    }).lean();
}

const searchGeoSpatialByBoundedPursuit = (IDs, coordinates, max, pursuit, experience) => {
    const list = IDs.map(ID => mongoose.Types.ObjectId(ID));
    const nearLimit = {
        "location.coordinates":
        {
            $near:
            {
                $geometry: { type: "Point", coordinates: coordinates },
                $maxDistance: max
            }
        }
    }
    const returnedExactExperience =
        selectModel(ModelConstants.USER_PREVIEW)
            .find({
                _id: { $nin: list },
                pursuits: {
                    $elemMatch: {
                        name: pursuit,
                        experience_level: experience
                    }
                },
                ...nearLimit
            }
            ).lean();

    const returnedDifferentExperience
        = selectModel(ModelConstants.USER_PREVIEW)
            .find({
                _id: { $nin: list },
                pursuits: {
                    $elemMatch: {
                        name: pursuit,
                        experience_level: { $ne: experience }
                    }
                },
                ...nearLimit
            }
            ).lean();

    return Promise.all([returnedExactExperience, returnedDifferentExperience])
        .then(results => {
            return {
                name: pursuit,
                exact: results[0],
                different: results[1]
            }
        }).catch(err => console.log(err));
}

// const findRemainderUsersByExperience = (results) => {
//     let pursuits = {};
//     for (const pursuit of results) {
//         const beginner = [];
//         const familiar = [];
//         const experienced = [];
//         const expert = [];
//         for (const user of pursuit) {
//             for (let i = 1; i < user.pursuits.length; i++) {
//                 if (user.pursuits[i] === results.type) {
//                     switch (user.pursuits[i].experience_level) {
//                         case (BEGINNER):
//                             beginner.push(data);
//                             break;
//                         case (FAMILIAR):
//                             familiar.push(data);
//                             break;
//                         case (EXPERIENCED):
//                             experienced.push(data);
//                             break;
//                         case (EXPERT):
//                             expert.push(data);
//                             break;
//                         default:
//                             break;
//                     }
//                 }

//             }
//         }
//         pursuits[results.type] = {
//             beginner
//         }
//     }
// }

const appendPostData = (users, pursuit) => {
    console.log(users);
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

const searchBranchData = (type, indexUserID, requestQuantity) => {
    return limitFind(type, {
        index_user_id: mongoose.Types.ObjectId(indexUserID),
        $or:
            [
                { 'ancestor_id': { $ne: null } },
                { 'parent_project_id': { $ne: null } },
            ]
    }, requestQuantity)
        .then(results => {
            console.log(results);
            return results;
        });
}

const searchProjectData = (type, pursuitList, IDList, requestQuantity, indexUserID, childrenFlag) => {
    return limitFind(type, {
        _id: { $nin: IDList },
        index_user_id: { $ne: mongoose.Types.ObjectId(indexUserID) },
        pursuit: { $in: pursuitList },
        ...(childrenFlag && { childrenFlag: true })
    }, requestQuantity)
        .then(results => {
            console.log(results);
            return results;
        });
}

const searchUncached = (type, IDList, requestQuantity, indexUserID) => {
    return limitFind(type, {
        _id: { $nin: IDList },
        index_user_id: { $ne: mongoose.Types.ObjectId(indexUserID) },
    }, requestQuantity)
        .then(results => {
            return results;
        });
}

const searchRelatedWithKeys = (pursuit, labels, excluded) => {
    // https://stackoverflow.com/questions/28547309/how-do-i-find-documents-with-array-field-that-contains-as-many-of-the-keywords-a
    return selectModel(ModelConstants.PROJECT_PREVIEW_WITH_ID)
        .aggregate([
            {
                $match: {
                    "_id": { $ne:  mongoose.Types.ObjectId(excluded) },
                    "pursuit": { $eq: pursuit },
                    "labels": { $in: labels }
                }
            },
            {
                $project: {
                    "weight": { $size: { $setIntersection: ["$labels", labels] } },
                    "labels": "$labels",
                    "pursuit": 1,
                    "title": 1,
                    "project_id": 1,
                    "has_children": 1,
                    "updatedAt": "$updatedAt"
                }
            },
            {
                $sort: {
                    "weight": -1,
                    "updatedAt": -1,
                }
            },
            { $limit: 3 },
            {
                $project: {
                    "pursuit": 1,
                    "labels": 1,
                    "updatedAt": 1,
                    "title": 1,
                    "project_id": 1,
                    "has_children": 1,
                }
            }
        ])
}

const searchRelatedNoKeys = (pursuit) => {
    // https://stackoverflow.com/questions/28547309/how-do-i-find-documents-with-array-field-that-contains-as-many-of-the-keywords-a
    return selectModel(ModelConstants.PROJECT_PREVIEW_WITH_ID)
        .aggregate([
            {
                $match: {
                    "_id": { $ne:  mongoose.Types.ObjectId(excluded)},
                    "pursuit": { $eq: pursuit },
                }
            },
            {
                $project: {
                    "labels": "$labels",
                    "pursuit": 1,
                    "title": 1,
                    "project_id": 1,
                    "has_children": 1,
                    "updatedAt": "$updatedAt"
                }
            },
            {
                $sort: {
                    "updatedAt": -1,
                }
            },
            { $limit: 3 },
            {
                $project: {
                    "pursuit": 1,
                    "labels": 1,
                    "updatedAt": 1,
                    "title": 1,
                    "project_id": 1,
                    "has_children": 1,
                }
            }
        ])
}


exports._sortByDate = _sortByDate;
exports.getDistance = getDistance;
exports.getBounds = getBounds;
exports.searchByBounds = searchByBounds;
exports.searchByBoundedPursuits = searchByBoundedPursuits;
exports.searchGeoSpatialByBoundedPursuit = searchGeoSpatialByBoundedPursuit;
exports.searchBranchData = searchBranchData;
exports.appendPostData = appendPostData;
exports.searchProjectData = searchProjectData;
exports.searchUncached = searchUncached;
exports.searchRelatedWithKeys = searchRelatedWithKeys;
exports.searchRelatedNoKeys = searchRelatedNoKeys;