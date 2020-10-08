
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
  const targetUsername = req.body.targetUsername;
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


  //FIXME ADD IN THE STUFF TO ADD WHO YOURE FOLLOWING TO YOUR OWN USERRELATION

  // '_id': { $in: followersArray }, function(err, docs) {
  //   if (err) console.log(err);
  //   else {
  //     console.log(docs);
  //   }
  // }

  const resolvedVisitor = IndexUser.Model.findOne({ username: visitorUsername });
  const resolvedUserRelation = resolvedVisitor.then(
    (result) => {  
      indexUser = result;
      //need id of the target user and currentuser
      const userRelationArray = [targetUserRelationId, indexUser.user_relation_id]
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
        let visitorFollowingArray = userRelation[0].following;
        let targetFollowersArray = userRelation[1].followers;
        let user = null;
        switch (action) {
          case (FOLLOW):
            for (const follower of targetFollowersArray) {
              if (follower.id.toString() === indexUser._id.toString()) {
                return Promise.reject("Already Following User");
              }
            }
            if (indexUser.private === true) {
              targetFollowersArray.push(new UserPreview.Model({
                status: FOLLOW_REQUESTED,
                id: indexUser._id,
                username: visitorUsername,
              }));
              resultStatus = FOLLOW_REQUESTED;
            }
            else {
              targetFollowersArray.push(new UserPreview.Model({
                status: FOLLOWING,
                id: indexUser._id,
                username: visitorUsername,
              }));
              visitorFollowingArray.push(new UserPreview.Model({
                status: FOLLOWING,
                id: userRelation[0].parent_user_id,
                username: targetUsername,
              }));
              resultStatus = FOLLOWING;
            }
            break;
          case (ACCEPT_REQUEST):
            for (const follower of targetFollowersArray) {
              if (follower.id.toString() === indexUser._id.toString()) {
                user = follower;
                break;
              }
            }
            user.status = FOLLOWING;
            resultStatus = REQUEST_ACCEPTED;
            break;
          case (UNFOLLOW):
            let newFollowers = [];
            for (const follower of targetFollowersArray) {
              // console.log(follower);
              if (follower.id.toString() === indexUser._id.toString()) {
                console.log("1");
                user = follower;
                break;
              }
              else {
                newFollowers.push(follower);
              }
            }
            userRelation[0].followers = newFollowers;
            resultStatus = UNFOLLOWED;
            break;
          default:
            break;
        }

        console.log(userRelation[0]);
        return (userRelation[0].save().then(() => userRelation[1].save()))
      }
    )
  
  resolvedUpdate.then(() => {
    console.log("BOth saved");
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
      res.status(500).send(error);
    });

})
module.exports = router;