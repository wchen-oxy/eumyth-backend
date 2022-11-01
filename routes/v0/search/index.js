const express = require('express');
const { doesValidationErrorExist, PARAM_CONSTANTS, buildQueryValidationChain } = require('../../../shared/validators/validators');
const relevance = require('./branches');
const router = express.Router();
const searchServices = require('./services');
const ModelConstants = require('../../../models/constants');
const branches = require('./branches');
const peopleFinder = require('./peopleFinder');

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
                        .map((value) => {
                            console.log(value.latitude);
                            value['distance'] = searchServices
                                .getDistance(
                                    lat,
                                    value.coordinates.latitude,
                                    long,
                                    value.coordinates.longitude
                                );
                            return ({ value, sort: Math.random() })
                        })
                        .sort((a, b) => a.sort - b.sort)
                        .map(({ value }) => value);
                    return res.status(200).json({ users: shuffled.slice(0, 2) });
                })
                .catch(next);
        }
    );

router.route('/simple_people')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.DISTANCE,
            PARAM_CONSTANTS.PURSUIT,
            PARAM_CONSTANTS.LATITUDE,
            PARAM_CONSTANTS.LONGITUDE
        ),
        doesValidationErrorExist,
        peopleFinder,
        (req, res, next) => {
            return searchServices.appendPostData(res.locals.users)
                .then(results => res.status(200).json({ users: results }))
                .catch(next);
        }
    );

router.route('/advanced_people')
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

            //hardcode 10000 miles in for now for a limit


            /**
                people who are close by coordinates
                of said people, how many are within the hobby
                    if no results, search wider
                    else, sort based off of experience level
                        for those that have been found, sort by the last update
            */



        }
    )

router.route('/branches')
    .get(buildQueryValidationChain(
        PARAM_CONSTANTS.DISTANCE,
        PARAM_CONSTANTS.PURSUIT,
        PARAM_CONSTANTS.LATITUDE,
        PARAM_CONSTANTS.LONGITUDE
    ),
        doesValidationErrorExist,
        branches
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
            const projectIDList = req.query.projectIDList ? req.query.projectIDList : [];
            return searchServices.searchProjectData(ModelConstants.PROJECT, pursuitList, projectIDList, requestQuantity, indexUserID)
                .then(results => res.status(201).json(results))
                .catch(next);
        }
    );

router.route('/branches')
    .get(buildQueryValidationChain(PARAM_CONSTANTS.PURSUIT_ARRAY),
        doesValidationErrorExist,
        relevance
    )

module.exports = router;
