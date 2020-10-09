
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
  const isPrivate = req.body.isPrivate;
  const action = req.body.action;
  let visitingIndexUser = null;
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

  // console.log(visitorUsername);
  // console.log(targetUsername);
  const resolvedVisitor = IndexUser.Model.findOne({ username: visitorUsername });
  const resolvedUserRelation = resolvedVisitor.then(
    (result) => {
      visitingIndexUser = result;
      //need id of the target user and currentuser
      // console.log(visitingIndexUser);
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
        // console.log(userRelation[0]._id.toString() === targetUserRelationId.toString() ? userRelation[0]  : userRelation[1] );
        // console.log( userRelation[1]._id.toString() === visitingIndexUser.user_relation_id.toString() ? userRelation[1]  : userRelation[0] );
        switch (action) {
          case (FOLLOW):
            for (const follower of targetFollowersArray) {
              if (follower.id.toString() === visitingIndexUser._id.toString()) {
                return Promise.reject("Already Following User");
              }
            }
            //targetuser is private?
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
            console.log("unfoolowed");
            let updatedTargetFollowers = [];
            let updatedVisitorFollowing = [];
            for (const follower of targetFollowersArray) {
           
              if (follower.id.toString() !== visitorUser.parent_index_user_id.toString()) {
                console.log(follower);
                updatedTargetFollowers.push(follower);
              }
            }
         
            for (const followingPerson of visitorFollowingArray) {
              // console.log(follower);
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
        // console.log(targetUser);
        // console.log(visitorUser);

        const savedTargetFollowers = targetUser.save();
        const savedVisitorFollowing = visitorUser.save();
       
        return (Promise.all([savedTargetFollowers, savedVisitorFollowing]));
      }
    )

  resolvedUpdate.then((result) => {
    console.log(result);
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