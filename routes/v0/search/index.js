const express = require('express');
const selectModel = require('../../../models/modelServices');
const { doesValidationErrorExist, PARAM_CONSTANTS, buildQueryValidationChain } = require('../../../shared/validators/validators');
const router = express.Router();
const searchServices = require('./services');

//http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
//https://stackoverflow.com/questions/238260/how-to-calculate-the-bounding-box-for-a-given-lat-lng-location

router.route('/spotlight')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.LATITUDE,
            PARAM_CONSTANTS.LONGITUDE,
            PARAM_CONSTANTS.DISTANCE,
            PARAM_CONSTANTS.USER_PREVIEW_ID_LIST),
        doesValidationErrorExist,
        (req, res, next) => {
            const lat = req.query.latitude;
            const long = req.query.longitude;
            const distance = req.query.distance;
            const userPreviewIDList = req.query.userPreviewIDList;
            const limits = searchServices.getBounds(distance, { lat, long });
            return searchServices
                .searchByBounds(userPreviewIDList, limits)
                .then(results => {
                    let shuffled = results
                        .map((value) => ({ value, sort: Math.random() }))
                        .sort((a, b) => a.sort - b.sort)
                        .map(({ value }) => value);
                    return res.status(200).json({ users: shuffled.slice(0, 2) });
                })
                .catch(next);
        }
    );

router.route('/people')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.DISTANCE,
            PARAM_CONSTANTS.PURSUIT,
            PARAM_CONSTANTS.LATITUDE,
            PARAM_CONSTANTS.LONGITUDE
        ),
        doesValidationErrorExist,
        (req, res, next) => {
            const distance = req.query.distance;
            const userPreviewIDList = req.query.userPreviewIDList ? req.query.userPreviewIDList : [];
            const pursuit = req.query.pursuit;
            const lat = req.query.latitude;
            const long = req.query.longitude;
            const limits = searchServices.getBounds(distance, { lat, long });
            return searchServices
                .searchByBoundedPursuits(userPreviewIDList, limits, pursuit)
                .then(searchServices.appendPostData)
                .then(results => res.status(200).json({ users: results }))
                .catch(next)
        }
    );

router.route('/posts')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.DISTANCE,
            PARAM_CONSTANTS.DIFFICULTY,
            PARAM_CONSTANTS.PROGRESSION,
            PARAM_CONSTANTS.USER_PREVIEW_ID_LIST),

        doesValidationErrorExist,
        (req, res, next) => {
            const difficulty = req.query.difficulty;
            const progression = req.query.progression;
            return searchServices
                .searchByBounds(userPreviewIDList, limits)
                .then()
        });


//pursuit type, recent, community pick
router.route('/projects').
    get(buildQueryValidationChain(
        PARAM_CONSTANTS.PURSUIT,
        PARAM_CONSTANTS.REQUEST_QUANTITY,
        PARAM_CONSTANTS.SUBMITTING_INDEX_USER_ID
    ),
        doesValidationErrorExist,
        (req, res, next) => {
            const pursuitList = req.query.pursuit;
            const indexUserID = req.query.submittingIndexUserID;
            const requestQuantity = parseInt(req.query.requestQuantity);
            console.log(indexUserID);
            const projectIDList = req.query.projectIDList ? req.query.projectIDList : [];
            return searchServices.searchProjects(pursuitList, projectIDList, requestQuantity, indexUserID)
                .then(results => res.status(201).json(results))
                .catch(next);
        }
    );


module.exports = router;
