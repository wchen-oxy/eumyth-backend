
const express = require('express');
const router = express.Router();
const UserPreview = require('../../models/user.preview.model');
const UserRelationStatus = require("../../models/user.relation.status.model");
const { validateQueryVisitorUsername, validateQueryUsername, validateQueryUserRelationArrayID, validateBodyUserRelationArrayID, validateBodyUsername, doesValidationErrorExist, validateBodyVisitorUsername, validateBodyTargetProfilePreviewID, validateBodyIsPrivate, validateBodyAction, validateBodyID, validateBodyTargetUsername, validateBodyCurrentUsername, } = require('../../utils/validators');
const { findUserRelations,
  retrieveUserPreviewByUsername,
  retrieveUserRelationByID } = require('../../data_access/dal');
const NOT_A_FOLLOWER_STATE = "NOT_A_FOLLOWER";

router.route('/').get(
  validateQueryVisitorUsername,
  validateQueryUserRelationArrayID,
  doesValidationErrorExist,
  (req, res, next) => {
    const visitorUsername = req.query.visitorUsername;
    const followerArrayId = req.query.userRelationArrayID;
    let resolvedVistorPreviewId = retrieveUserPreviewByUsername(visitorUsername);
    return resolvedVistorPreviewId
      .then((visitorUserPreview) => {
        return retrieveUserRelationByID(followerArrayId)
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
  validateQueryUsername,
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    let ID = null;
    return retrieveUserPreviewByUsername(username)
      .then((user) => {
        return retrieveUserRelationByID(user.user_relation_id)
      })
      .then((result) => {
        ID = result._id;
        let following = [];
        let followers = [];
        let requested = [];
        for (const profile of result.following) {
          following.push(profile.user_preview_id);
        }
        for (const profile of result.followers) {
          if (profile.status === "FOLLOW_REQUESTED") {
            requested.push(profile.user_preview_id);
          }
          else if (profile.status === "FOLLOWING") {
            followers.push(profile.user_preview_id);
          }
        }
        const resolvedFollowing = UserPreview.Model.find({
          '_id': { $in: following }
        }, function (error, docs) {
          if (error) console.log(error);
          else {
            console.log(docs)
          }
        });
        const resolvedFollowers = UserPreview.Model.find({
          '_id': { $in: followers }
        }, function (error, docs) {
          if (error) console.log(error);
          else {
            console.log(docs)
          }
        });
        const resolvedRequested = UserPreview.Model.find({
          '_id': { $in: requested }
        }, function (error, docs) {
          if (error) console.log(error);
          else {
            console.log(docs)
          }
        });

        return Promise.all([
          resolvedFollowing,
          resolvedFollowers,
          resolvedRequested]);
      })
      .then((profiles) => {
        let finalFollowing = [];
        let finalFollowers = [];
        let finalRequested = [];
        for (const profile of profiles[0]) {
          const username = profile.username;
          finalFollowing.push({
            username: username,
            display_photo: profile.tiny_cropped_display_photo_key
          });
        }
        for (const profile of profiles[1]) {
          const username = profile.username;
          finalFollowers.push({
            username: username,
            display_photo: profile.tiny_cropped_display_photo_key
          });
        }
        for (const profile of profiles[2]) {
          const username = profile.username;
          finalRequested.push({
            username: username,
            display_photo: profile.tiny_cropped_display_photo_key
          });
        }
        return res.status(200).json({
          _id: ID,
          following: finalFollowing,
          followers: finalFollowers,
          requested: finalRequested
        });
      })
      .catch(next)
  })

router.route('/status').put(
  validateBodyVisitorUsername,
  validateBodyUserRelationArrayID,
  validateBodyTargetProfilePreviewID,
  validateBodyIsPrivate,
  validateBodyAction,
  doesValidationErrorExist,
  (req, res, next) => {
    const visitorUsername = req.body.visitorUsername;
    const targetUserRelationID = req.body.userRelationArrayID;
    const targetUserPreviewID = req.body.targetProfilePreviewID;
    let visitorUserPreview = null;
    const isPrivate = req.body.isPrivate;
    const action = req.body.action;
    let resultStatus = "";

    const FOLLOW = "FOLLOW";
    const ACCEPT_REQUEST = "ACCEPT_REQUEST";
    const UNFOLLOW = "UNFOLLOW";
    const FOLLOW_REQUESTED = "FOLLOW_REQUESTED";
    const FOLLOWING = "FOLLOWING";
    const REQUEST_ACCEPTED = "REQUEST_ACCEPTED";
    const UNFOLLOWED = "UNFOLLOWED";

    const resolvedVisitor = retrieveUserPreviewByUsername(visitorUsername);

    const resolvedUserRelation = resolvedVisitor
      .then((result) => {
        visitorUserPreview = result;
        const userRelationArray = [
          targetUserRelationID,
          visitorUserPreview.user_relation_id];
        return findUserRelations(userRelationArray)
      });

    const resolvedUpdate = resolvedUserRelation
      .then((userRelation) => {
        const targetUserRelation =
          userRelation[0]._id.toString() === targetUserRelationID.toString()
            ? userRelation[0]
            : userRelation[1];
        const visitorUserRelation =
          userRelation[1]._id.toString() === visitorUserPreview
            .user_relation_id.toString()
            ? userRelation[1]
            : userRelation[0];
        let targetFollowersArray = targetUserRelation.followers;
        let visitorFollowingArray = visitorUserRelation.following;
        let user = null;
        switch (action) {
          case (FOLLOW):
            for (const follower of targetFollowersArray) {
              if (follower.user_preview_id.toString()
                === visitorUserPreview._id.toString()) {
                return Promise.reject("Already Following User");
              }
            }
            if (isPrivate === true) {
              targetFollowersArray.push(new UserRelationStatus.Model({
                status: FOLLOW_REQUESTED,
                user_preview_id: visitorUserPreview._id,
              }));

              visitorFollowingArray.push(new UserRelationStatus.Model({
                status: FOLLOW_REQUESTED,
                user_preview_id: targetUserPreviewID,
              }));

              resultStatus = FOLLOW_REQUESTED;
            }
            else {
              targetFollowersArray.push(new UserRelationStatus.Model({
                status: FOLLOWING,
                user_preview_id: visitorUserPreview._id,
              }));

              visitorFollowingArray.push(new UserRelationStatus.Model({
                status: FOLLOWING,
                user_preview_id: targetUserPreviewID,
              }));

              resultStatus = FOLLOWING;
            }
            break;
          case (ACCEPT_REQUEST):
            for (const follower of targetFollowersArray) {
              if (follower.user_preview_id.toString()
                === visitorUserPreview._id.toString()) {
                user = follower;
                break;
              }
            }
            user.status = FOLLOWING;
            resultStatus = REQUEST_ACCEPTED;
            break;
          case (UNFOLLOW):
            let updatedTargetFollowers = [];
            let updatedVisitorFollowing = [];
            for (const follower of targetFollowersArray) {
              if (follower.user_preview_id.toString()
                !== visitorUserPreview._id.toString()) {
                updatedTargetFollowers.push(follower);
              }
            }

            for (const followingPerson of visitorFollowingArray) {
              if (followingPerson.user_preview_id.toString()
                !== targetUserPreviewID.toString()) {
                updatedVisitorFollowing.push(followingPerson);
              }
            }
            targetUserRelation.followers = updatedTargetFollowers;
            visitorUserRelation.following = updatedVisitorFollowing;
            resultStatus = UNFOLLOWED;
            break;
          default:
            break;
        }
        const savedTargetFollowers = targetUserRelation.save();
        const savedVisitorFollowing = visitorUserRelation.save();

        return (Promise.all([savedTargetFollowers, savedVisitorFollowing]));
      })

    resolvedUpdate.then(() => {
      if (resultStatus === UNFOLLOWED) {
        return res.status(200).json({ error: NOT_A_FOLLOWER_STATE });
      }
      else {
        return res.status(200).json({ success: resultStatus });
      }
    })
      .catch(next);
  });

router.route('/set').put(
  validateBodyID,
  validateBodyTargetUsername,
  validateBodyCurrentUsername,
  validateBodyAction,
  doesValidationErrorExist,
  (req, res, next) => {
    const ID = req.body.ID;
    const targetUsername = req.body.targetUsername;
    const currentUsername = req.body.currentUsername;
    const action = req.body.action;
    let userRelation = null;

    if (action === "UNFOLLOW") {
      return retrieveUserRelationByID(ID)
        .then(result => {
          userRelation = result;
          let updatedFollowing = [];
          let followingUserRelationID = null;
          for (const profile of userRelation.following) {
            if (profile.username === targetUsername) {
              followingUserRelationID = profile.user_relation_id;
            }
            else if (profile.username !== targetUsername) {
              updatedFollowing.push(profile);
            }
          }
          userRelation.following = updatedFollowing;
          userRelation.save();
          return retrieveUserRelationByID(followingUserRelationID);
        })
        .then((result) => {
          let followerUserRelation = result;
          let updatedFollowers = [];
          for (const profile of followerUserRelation.followers) {
            if (profile.username !== currentUsername) {
              updatedFollowers.push(profile);
            }
          }
          followerUserRelation.followers = updatedFollowers;
          return followerUserRelation.save();
        })
        .then(() => res.status(200).send())
        .catch((error) => {
          console.log(error);
          if (204) res.status(204).send("No User Found");
          return res.status(500).json({ error: error });
        });
    }
    else {
      return retrieveUserRelationByID(ID)
        .then((result) => {
          userRelation = result;
          for (const profile of userRelation.followers) {
            if (profile.username === targetUsername) {
              profile.status = action === 'ACCEPT' ? "FOLLOWING" : "DECLINED";
              userRelation.save();
              return retrieveUserRelationByID(profile.user_relation_id);
            }
          }
        })
        .then((result) => {
          for (const profile of result.followers) {
            if (profile.user_relation_id === ID) {
              profile.status = action === 'ACCEPT' ? "FOLLOWING" : "DECLINED";
              result.save();
              return retrieveUserRelationByID(profile.user_relation_id);
            }
          }
        })
        .then(() => res.status(200).send())
        .catch(next)
    }
  })

module.exports = router;