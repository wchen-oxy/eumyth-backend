
var express = require('express');
var router = express.Router();
const UserPreview = require('../../models/user.preview.model');
const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');
const UserRelation = require('../../models/user.relation.model');
const NOT_A_FOLLOWER_STATE = "NOT_A_FOLLOWER";

router.route('/').get((req, res) => {
  const visitorUsername = req.query.visitorUsername;
  const followerArrayId = req.query.userRelationArrayId;
  return UserRelation.Model.findById(followerArrayId).then(
    (userRelationInfo) => {
      if (!userRelationInfo) return res.status(204).send();
      else {
        if (userRelationInfo.followers.length !== 0) {
          for (const user of userRelationInfo.followers) {
            if (visitorUsername === user.username) {
              return res.status(200).json({ success: user.status });
            }
          }
          return res.status(200).json({ error: NOT_A_FOLLOWER_STATE });
        }
        return res.status(200).json({ error: NOT_A_FOLLOWER_STATE });
      }
    }
  )
    .catch(err => {
      console.log(err);
      res.status(500).send();
    });
});

router.route('/info').get((req, res) => {
  const username = req.query.username;
  return User.Model.findOne({username: username})
  .then((user) => {
    return UserRelation.Model.findById(user.user_relation_id)
  })
  .then((result) => res.status(200).json(result))
  .catch(err => {
    console.log(err);
    return res.status(500).send();
  })
})

router.route('/status').put((req, res) => {
  const visitorUsername = req.body.visitorUsername;
  const targetUsername = req.body.targetUsername;
  const targetUserRelationId = req.body.targetUserRelationId;
  const isPrivate = req.body.isPrivate;
  const action = req.body.action;
  let visitingIndexUser = null;
  let resultStatus = "";

  const FOLLOW = "FOLLOW";
  const ACCEPT_REQUEST = "ACCEPT_REQUEST";
  const UNFOLLOW = "UNFOLLOW";
  const FOLLOW_REQUESTED = "FOLLOW_REQUESTED";
  const FOLLOWING = "FOLLOWING";
  const REQUEST_ACCEPTED = "REQUEST_ACCEPTED";
  const UNFOLLOWED = "UNFOLLOWED";

  const resolvedVisitor = IndexUser.Model.findOne({ username: visitorUsername });
  const resolvedUserRelation = resolvedVisitor.then(
    (result) => {
      visitingIndexUser = result;
      const userRelationArray = [targetUserRelationId, visitingIndexUser.user_relation_id];
      return UserRelation.Model.find({
        '_id': { $in: userRelationArray }, function(err, docs) {
          if (err) console.log(err);
          else {
            console.log(docs);
          }
        }
      })
    }
  );
  const resolvedUpdate = resolvedUserRelation
    .then(
      (userRelation) => {
        const targetUser = userRelation[0]._id.toString() === targetUserRelationId.toString() ? userRelation[0] : userRelation[1];
        const visitorUser = userRelation[1]._id.toString() === visitingIndexUser.user_relation_id.toString() ? userRelation[1] : userRelation[0];
        let targetFollowersArray = targetUser.followers;
        let visitorFollowingArray = visitorUser.following;
        let user = null;
        switch (action) {
          case (FOLLOW):
            for (const follower of targetFollowersArray) {
              if (follower.id.toString() === visitingIndexUser._id.toString()) {
                return Promise.reject("Already Following User");
              }
            }
            if (isPrivate === true) {
              targetFollowersArray.push(new UserPreview.Model({
                status: FOLLOW_REQUESTED,
                id: visitorUser.parent_index_user_id,
                username: visitorUsername,
              }));
              visitorFollowingArray.push(new UserPreview.Model({
                status: FOLLOW_REQUESTED,
                id: targetUser.parent_index_user_id,
                username: targetUsername,
              }));
              resultStatus = FOLLOW_REQUESTED;
            }
            else {
              targetFollowersArray.push(new UserPreview.Model({
                status: FOLLOWING,
                id: visitorUser.parent_index_user_id,
                username: visitorUsername,
              }));
              visitorFollowingArray.push(new UserPreview.Model({
                status: FOLLOWING,
                id: targetUser.parent_index_user_id,
                username: targetUsername,
              }));
              resultStatus = FOLLOWING;
            }
            break;
          case (ACCEPT_REQUEST):
            for (const follower of targetFollowersArray) {
              if (follower.id.toString() === visitorUser.parent_index_user_id.toString()) {
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

              if (follower.id.toString() !== visitorUser.parent_index_user_id.toString()) {
                updatedTargetFollowers.push(follower);
              }
            }

            for (const followingPerson of visitorFollowingArray) {
              if (followingPerson.id.toString() !== targetUser.parent_index_user_id.toString()) {
                updatedVisitorFollowing.push(followingPerson);
              }
            }
            targetUser.followers = updatedTargetFollowers;
            visitorUser.following = updatedVisitorFollowing;
            resultStatus = UNFOLLOWED;
            break;
          default:
            break;
        }
        const savedTargetFollowers = targetUser.save();
        const savedVisitorFollowing = visitorUser.save();

        return (Promise.all([savedTargetFollowers, savedVisitorFollowing]));
      }
    )

  resolvedUpdate.then((result) => {
    if (resultStatus === UNFOLLOWED) {
      res.status(200).json({ error: NOT_A_FOLLOWER_STATE });
    }
    else {
      res.status(200).json({ success: resultStatus });
    }

  })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });

})
module.exports = router;