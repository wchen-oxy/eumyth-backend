const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');
const Post = require("../../models/post.model");
const multer = require('multer');
const AWS = require('aws-sdk');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3');
const uuid = require('uuid');
const userRelation = require('../../models/user.relation.model');


const setPursuitAttributes = (isMilestone, pursuit, minDuration) => {
  if (isMilestone) { pursuit.num_milestones = Number(pursuit.num_milestones) + 1; }
  console.log(pursuit.total_min);
  pursuit.total_min = Number(pursuit.total_min) + minDuration;
  console.log(pursuit.total_min);
  pursuit.num_posts = Number(pursuit.num_posts) + 1;
  return pursuit;
}

const s3 = new AWS.S3({
  accessKeyId: AwsConstants.ID,
  secretAccessKey: AwsConstants.SECRET
});


var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AwsConstants.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "images/content/" + uuid.v1())
    }
  })
});

const getImageUrls = (array) => {
  // console.log(mongooseArray);
  let imageArray = [];
  for (const imageFile of array) {
    imageArray.push(imageFile.location);
  }
  return imageArray;
}

router.route('/').put(upload.fields([{ name: "images" }, { name: "coverPhoto", maxCount: 1 }]), (req, res) => {

  const postType = !!req.body.postType ? req.body.postType : null;
  const username = req.body.username;
  const title = !!req.body.title ? req.body.title : null;
  const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
  const postPrivacyType = !!req.body.postPrivacyType ? req.body.postPrivacyType : null;
  const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
  const date = !!req.body.date ? req.body.date : null;
  const textData = !!req.body.textData ? req.body.textData : null;
  const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
  const isMilestone = !!req.body.isMilestone ? req.body.isMilestone : null;
  const coverPhotoURL = req.files.coverPhoto ? req.files.coverPhoto[0].location : null;
  const imageData = req.files.images ? getImageUrls(req.files.images) : [];
  // console.log(imageData);

  let post = null;
  let indexUser = null;
  let followerArrayID = null;
  const resolveIndexUser = IndexUser.Model.findOne({ username: username }).then(
    indexUserResult => {
      indexUser = indexUserResult;
      return indexUserResult;
    }
  ).catch(
    err => {
      console.log(err);
      res.status(500).send(err);
    }
  );



  let resolveNewPost = resolveIndexUser.then(resolvedIndexUser => {
    switch (postType) {
      case ("SHORT"):
        post = new Post.Model({
          title: title,
          private: postPrivacyType,
          date: date,
          author_id: resolvedIndexUser.user_profile_id,
          pursuit_category: pursuitCategory,
          cover_photo_url: coverPhotoURL,
          post_format: postType,
          is_paginated: req.body.isPaginated,
          is_milestone: isMilestone,
          image_data: imageData,
          text_data: textData,
          min_duration: minDuration
        });
        break;
      case ("LONG"):
        post = new Post.Model({
          title: title,
          subtitle: subtitle,
          private: postPrivacyType,
          author_id: resolvedIndexUser.user_profile_id,
          pursuit_category: pursuitCategory,
          cover_photo_url: coverPhotoURL,
          post_format: postType,
          is_paginated: req.body.isPaginated,
          is_milestone: isMilestone,
          text_data: req.body.textData,
          min_duration: minDuration
        });
        break;
      default:
        res.status(500).send();
    }
    //save followerArray for query
    followerArrayID = indexUser.user_relation_id;
    //modify new post array for indexUser

    if (indexUser.preferred_post_type !== postPrivacyType) {
      indexUser.preferred_post_type = postPrivacyType;
    }

    if (minDuration) {
      for (const pursuit of indexUser.pursuits) {
        if (pursuit.name === pursuitCategory) {
          setPursuitAttributes(isMilestone, pursuit, minDuration);
          break;
        }
      }
    }

    return resolvedIndexUser.user_profile_id;
  }
  );

  //modify new post array for User
  let resolveUser = resolveNewPost.then(
    (result) => {
      return User.Model.findById(result);
    }
  );
  resolveUser.then(
    resolvedUser => {
      const user = resolvedUser;
      user.all_posts.push(post._id);
      user.recent_posts.push(post);

      //check if pursuits exists already
      if (minDuration) {
        for (const pursuit of user.pursuits) {
          if (pursuit.name === pursuitCategory) {
            setPursuitAttributes(isMilestone, pursuit, minDuration);
            break;
          }
        }
      }
      return user;
    }
  ).
    then(user => {
      console.log(user.all_posts);
      const savedIndexUser = indexUser.save().catch(err => {
        if (err) {
          console.log(err);
          res.status(500).json('Error: ' + err);
        }
        return
      });
      const savedUser = user.save().catch(err => {
        if (err) {
          console.log(err);
          res.status(500).json('Error: ' + err);
        }
      });
      const savedPost = post.save().catch(err => {
        if (err) {
          console.log(err);
          res.status(500).json('Error: ' + err);
        }
      });
      return Promise.all([savedIndexUser, savedUser, savedPost]);
    })
    .then(
      (result) => {
        console.log(result);
        return userRelation.Model.findById(followerArrayID)
        
      }
    )
    .then(
      (userRelationResult) => {
        console.log(userRelationResult)
        //INSERT CODE TO PUSH TO FRIENDS
        //ADD THE PROMISE INTO THE INDEXUSER.FINDBYID
        if (userRelationResult) {
          let followersArray = [];
          for (const user of userRelationResult.followers) {
            console.log(typeof (user.id));
            followersArray.push(user.id);
          }
          console.log(followersArray);
          return IndexUser.Model.find({
            '_id': { $in: followersArray }, function(err, docs) {
              if (err) console.log(err);
              else {
                console.log(docs);
              }
            }
          });

          // const promisedFollowers = userRelationResult.followers.map(
          //   user => new Promise((resolve, reject) => 
          //     () => IndexUser.findById(user.id).then(indexUser => {
          //       console.log("user " + indexUser);
          //       if (indexUser) resolve(indexUser);
          //       else{
          //         reject(new Error('User not found for User in follower list'));
          //       }
          //     })
          //   ));
          //   console.log("REturning promise in 208");
          //   console.log(promisedFollowers);
          // return Promise.all(promisedFollowers).then(result => {console.log(result); return result});            
        }
        else{
          Promise.reject("Unable to push new posts to followers because User Relation was not found.");
        }
      }
    )
    .then(
        (userArray) => {
          //resolved users
          const promisedUpdatedFollowerArray = userArray.map(
            indexUser => new Promise((resolve) => {
              indexUser.following_feed.push(post);
              indexUser.save().then(() => resolve("saved"));
            })
          );
          return Promise.all(promisedUpdatedFollowerArray).then((result) => {
            console.log("Finished!");
            console.log(result);
          });
        }    
    )
    .then(
      () => res.status(201).send("Feel Free to continue browsing as we push updates")
    ).
    catch(
      (err) => {
        console.log(err);
        res.status(500).json(err);
      }
    )

})

module.exports = router;
