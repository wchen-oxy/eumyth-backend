const express = require('express');
const router = express.Router();
const {
  PARAM_CONSTANTS,
  buildQueryValidationChain,
  buildBodyValidationChain,
  doesValidationErrorExist,
} = require('../../../shared/validators/validators');
const {
  findByID,
  findManyByID,
  findOne,
} = require('../../../data-access/dal');
const NOT_A_FOLLOWER_STATE = "NOT_A_FOLLOWER";
const relationServices = require('./services');
const ModelConstants = require('../../../models/constants');

const FOLLOW = "FOLLOW";
const ACCEPT_REQUEST = "ACCEPT_REQUEST";
const UNFOLLOW = "UNFOLLOW";
const FOLLOW_REQUESTED = "FOLLOW_REQUESTED";
const FOLLOWING = "FOLLOWING";
const REQUEST_ACCEPTED = "REQUEST_ACCEPTED";
const UNFOLLOWED = "UNFOLLOWED";

const rowDataSetter = (userPreviewArray) => {
  return userPreviewArray.map(profile => {
    return {
      username: profile.username,
      user_preview_id: profile._id,
      user_relation_id: profile.user_relation_id,
      display_photo: profile.tiny_cropped_display_photo_key
    }
  })
};

const statusChanger = (action, targetID, array) => {
  if (action === "DECLINED") {
    return array.filter(item => item.user_preview_id.toString() !== targetID)
  }
  else {
    for (let i = 0; i < array.length; i++) {
      if (array[i].user_preview_id.toString() === targetID) {
        console.log(array[i]);
        array[i].status = 'FOLLOWING';
        return null;
      }
    }
  }
}

router.route('/').get(
  buildQueryValidationChain(
    PARAM_CONSTANTS.VISITOR_USERNAME,
    PARAM_CONSTANTS.USER_RELATION_ID
  ),
  doesValidationErrorExist,
  (req, res, next) => {
    const visitorUsername = req.query.visitorUsername;
    const followerArrayId = req.query.userRelationID;
    let resolvedVistorPreviewId = findOne(ModelConstants.USER_PREVIEW, { username: visitorUsername });
    return resolvedVistorPreviewId
      .then((visitorUserPreview) => {
        console.log(visitorUserPreview)
        return findByID(ModelConstants.USER_RELATION, followerArrayId)
          .then(
            (userRelationInfo) => {
              if (!userRelationInfo) return res.status(204).send();
              else {
                if (userRelationInfo.followers.length !== 0) {
                  for (const user of userRelationInfo.followers) {
                    if (visitorUserPreview._id.toString()
                      === user.user_preview_id.toString()) {
                      return res.status(200).json({ success: user.status });
                    }
                  }
                  return res.status(200).json({ error: NOT_A_FOLLOWER_STATE });
                }
                return res.status(200).json({ error: NOT_A_FOLLOWER_STATE });
              }
            }
          )
      })
      .catch(next);
  });

router.route('/info').get(
  buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    let ID = null;
    return findOne(ModelConstants.USER_PREVIEW, { username: username })
      .then((user) => {
        return findByID(ModelConstants.USER_RELATION, user.user_relation_id)
      })
      .then((result) => {
        ID = result._id;
        let following = [];
        let followers = [];
        let requested = [];
        let requester = [];
        for (const profile of result.following) {
          if (profile.status === "FOLLOW_REQUESTED") {
            requester.push(profile.user_preview_id);
          }
          else if (profile.status === "FOLLOWING") {
            following.push(profile.user_preview_id);
          }
        }
        for (const profile of result.followers) {
          if (profile.status === "FOLLOW_REQUESTED") {
            requested.push(profile.user_preview_id);
          }
          else if (profile.status === "FOLLOWING") {
            followers.push(profile.user_preview_id);
          }
        }
        const resolvedFollowing = findManyByID(ModelConstants.USER_PREVIEW, following);
        const resolvedFollowers = findManyByID(ModelConstants.USER_PREVIEW, followers);
        const resolvedRequested = findManyByID(ModelConstants.USER_PREVIEW, requested);
        const resolvedRequester = findManyByID(ModelConstants.USER_PREVIEW, requester);
        
        return Promise.all([
          resolvedFollowing,
          resolvedFollowers,
          resolvedRequested,
          resolvedRequester
        ]);
      })
      .then((profiles) => {
        const finalFollowing = rowDataSetter(profiles[0]);
        const finalFollowers = rowDataSetter(profiles[1]);
        const finalRequested = rowDataSetter(profiles[2]);
        const finalRequester = rowDataSetter(profiles[3]);

        return res.status(200).json({
          _id: ID,
          following: finalFollowing,
          followers: finalFollowers,
          requested: finalRequested,
          requester: finalRequester
        });
      })
      .catch(next)
  })

router.route('/status').put(
  buildBodyValidationChain(
    PARAM_CONSTANTS.VISITOR_USER_RELATION_ID,
    PARAM_CONSTANTS.TARGET_USER_RELATION_ID,
    PARAM_CONSTANTS.ACTION
  ),
  doesValidationErrorExist,
  (req, res, next) => {
    const visitorUserRelationID = req.body.visitorUserRelationID;
    const targetUserRelationID = req.body.targetUserRelationID;
    const isPrivate = req.body.isPrivate;
    const action = req.body.action;
    const resolvedUpdate = findManyByID(
      ModelConstants.USER_RELATION,
      [targetUserRelationID, visitorUserRelationID])
      .then((userRelation) => {
        const targetUserRelation =
          userRelation[0]._id.toString() === targetUserRelationID
            ? userRelation[0]
            : userRelation[1];
        const visitorUserRelation =
          userRelation[1]._id.toString() === visitorUserRelationID
            ? userRelation[1]
            : userRelation[0];

        relationServices.setAction(
          targetUserRelation,
          visitorUserRelation,
          action,
          isPrivate)
        return Promise.all([
          targetUserRelation.save(),
          visitorUserRelation.save()]);
      })


    resolvedUpdate.then(() => res.status(200).json({ success: "DONE" }))
      .catch(next);
  });

module.exports = router;