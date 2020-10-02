
var express = require('express');
var router = express.Router();
const UserPreview = require('../../models/user.preview.model');
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

router.route('/status').put((req, res) => {
  const visitorUsername = req.body.visitorUsername;
  const targetUserRelationId = req.body.targetUserRelationId;
  const action = req.body.action;
  let indexUser = null;
  let resultStatus = "";
  //ACTION
  const FOLLOW = "FOLLOW";
  const ACCEPT_REQUEST = "ACCEPT_REQUEST";
  const UNFOLLOW = "UNFOLLOW";

  //FLAGS
  const FOLLOW_REQUESTED = "FOLLOW_REQUESTED";
  const FOLLOWING = "FOLLOWING";
  const REQUEST_ACCEPTED = "REQUEST_ACCEPTED";
  const UNFOLLOWED = "UNFOLLOWED";


  const resolvedVisitor = IndexUser.Model.findOne({ username: visitorUsername });
  const resolvedUserRelation = resolvedVisitor.then(
    (result) => {
      indexUser = result;
      return UserRelation.Model.findById(targetUserRelationId)
    }
  );
  const resolvedUpdate = resolvedUserRelation
    .then(
      (targetUserRelation) => {
        let followerArray = targetUserRelation.followers;
        let user = null;
        switch (action) {
          case (FOLLOW):
            for (const follower of followerArray) {
              if (follower.id.toString() === indexUser.user_profile_id.toString()) {
                resultStatus = FOLLOWING;
                break;
              }
            }
            if (indexUser.private === true) {
              followerArray.push(new UserPreview.Model({
                status: FOLLOW_REQUESTED,
                id: indexUser.user_profile_id,
                username: visitorUsername,
              }));
              resultStatus = FOLLOW_REQUESTED;
            }
            else {
              followerArray.push(new UserPreview.Model({
                status: FOLLOWING,
                id: indexUser.user_profile_id,
                username: visitorUsername,
              }));
              resultStatus = FOLLOWING;
            }
            break;
          case (ACCEPT_REQUEST):
            for (const follower of followerArray) {
              if (follower.id === indexUser.user_profile_id) {
                user = follower;
                break;
              }
            }
            user.status = FOLLOWING;
            resultStatus = REQUEST_ACCEPTED;
            break;
          case (UNFOLLOW):
            let newFollowers = [];
            for (const follower of followerArray) {
              // console.log(follower);
              if (follower.id.toString() === indexUser.user_profile_id.toString()) {
                console.log("1");
                user = follower;
                break;
              }
              else {
                newFollowers.push(follower);
              }
            }
            targetUserRelation.followers = newFollowers;
            resultStatus = UNFOLLOWED;
            break;
          default:
            break;
        }

        return (targetUserRelation.save())
      }
    )
  resolvedUpdate.then(() => {
    //FIXME FIX PROMISES WITH ACTION RESULT
    if (resultStatus === UNFOLLOWED) {
      res.status(200).json({ error: NOT_A_FOLLOWER_STATE });
    }
    else {
      res.status(200).json({ success: resultStatus });
    }

  })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });

})
module.exports = router;