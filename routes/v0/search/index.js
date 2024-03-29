const express = require('express');
const { doesValidationErrorExist, PARAM_CONSTANTS, buildQueryValidationChain } = require('../../../shared/validators/validators');
const relevance = require('./branches');
const router = express.Router();
const searchServices = require('./services');
const ModelConstants = require('../../../models/constants');
const branches = require('./branches');
const peopleFinder = require('./peopleFinder');
const experience2 = require('./experience2');
const peopleFinder2 = require('./peopleFinder2');
const relatedProject = require('./relatedProject');

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
            PARAM_CONSTANTS.PURSUITS,
            PARAM_CONSTANTS.LATITUDE,
            PARAM_CONSTANTS.LONGITUDE
        ),
        doesValidationErrorExist,
        peopleFinder2,
        experience2,
        (req, res, next) => {
            return res.status(200).json(res.locals.formatted);
        }
    )

router.route('/related-projects')
    .get(
        buildQueryValidationChain(
            PARAM_CONSTANTS.PURSUIT,
            PARAM_CONSTANTS.EXCLUDED,
        ),
        doesValidationErrorExist,
        relatedProject,
        (req, res, next) => {
            return res.status(200).json(res.locals.projects);
        }
    )

router.route('/branches')
    .get(buildQueryValidationChain(
        PARAM_CONSTANTS.INDEX_USER_ID
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
            return searchServices.searchProjectData(
                ModelConstants.PROJECT,
                pursuitList,
                projectIDList,
                requestQuantity,
                indexUserID
            )
                .then(results => res.status(201).json(results))
                .catch(next);
        }
    );

router.route('/uncached').get( //overflow
    buildQueryValidationChain(
        PARAM_CONSTANTS.CONTENT_ID_LIST,
        PARAM_CONSTANTS.USER_ID,
        PARAM_CONSTANTS.REQUEST_QUANTITY,
        PARAM_CONSTANTS.PURSUIT,
    ),
    doesValidationErrorExist,
    (req, res, next) => {
        const contentType = req.query.contentType;
        const contentIDList = req.query.contentIDList;
        const pursuit = req.query.pursuit;
        return searchServices.searchUncached(
            contentType,
            pursuit,
            contentIDList,
            parseInt(req.query.requestQuantity),
            req.query.userID
        )
            .then(results => {
                res.locals.results = results;
                next();
            });

    },
    (req, res, next) => { //package and send
        return res.status(201).json({ posts: res.locals.results })
    }
)

router.route('/branches')
    .get(buildQueryValidationChain(PARAM_CONSTANTS.PURSUIT_ARRAY),
        doesValidationErrorExist,
        relevance
    )

module.exports = router;
