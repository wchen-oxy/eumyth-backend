
var express = require('express');
var router = express.Router();
const UserPreview = require('../../models/user.preview.model');
const IndexUser = require('../../models/index.user.model');
const UserRelation = require('../../models/user.relation.model');

router.route('/').get((req, res) => {
  const targetUserId = req.query.userId;
  const followerArrayId = req.query.userRelationArrayId;
  console.log(targetUserId);
  console.log(followerArrayId);
  UserRelation.Model.findById(followerArrayId)
    .then(
      (userRelationInfo) => {
        console.log(userRelationInfo);
        if (!userRelationInfo) return res.status(204);
        else {
          if (userRelationInfo.followers.length !== 0) {
            for (const user of userRelationInfo.followers) {
              console.log(user.id);
              console.log(typeof (user.id));
              if (targetUserId === user.id.toString()) {
                return res.status(200).json({ success: user.type });
              }
            }
          }
          res.status(200).json({ error: "User Not in Follower List" });
        }
      }
    )
    .catch(err => {
      console.log(err);
      res.status(500);
    });

});

router.route('/status').put((req, res) => {
  const visitorUsername = req.body.visitorUsername;
  const targetUserRelationId = req.body.targetUserRelationId;
  const action = req.body.action;
  let indexUser = null;
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
        switch (action) {
          case ("FOLLOW"):
            for (const follower of followerArray) {
              if (follower.id.toString() === indexUser.user_profile_id.toString()) {
                console.log("UES");
                return ("EXISTS");
              }
            }
            if (result.private === true) {
              followerArray.push(new UserPreview.Model({
                status: "FOLLOW_REQUESTED",
                id: indexUser.user_profile_id,
                username: visitorUsername,
              }));
            }
            else {
              followerArray.push(new UserPreview.Model({
                status: "FOLLOWING",
                id: indexUser.user_profile_id,
                username: visitorUsername,
              }));
            }
            break;
          case ("ACCEPT_REQUEST"):
            let user = null;
            for (const follower of followerArray) {
              if (follower.username === indexUser.user_profile_id) {
                user = follower;
                break;
              }
            }
            user.status = "FOLLOWING";
            break;
          default:
            break;
        }
        targetUserRelation.save();
        return ("SAVED")
      }
    );

  resolvedUpdate.then((result) => {
    console.log(result);
    if (result === "SAVED") {
      res.status(200);
    }
    else {
     
      res.status(409).send();
    }
  })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });

})
module.exports = router;