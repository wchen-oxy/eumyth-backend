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
  let imageArray = [];
  for (const imageFile of array) {
    console.log(imageFile.location)
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
      case ("short"):
        post = new Post.Model({
          title: title,
          private: postPrivacyType,
          date: date,
          author_id: resolvedIndexUser.user_profile_id,
          pursuit_category: pursuitCategory,
          cover_photo_url: coverPhotoURL,
          post_format: postType,
          is_milestone: isMilestone,
          text_data: textData,
          image_data: imageData,
          min_duration: minDuration
        });
        break;
      case ("long"):
        post = new Post.Model({
          title: title,
          subtitle: subtitle,
          private: postPrivacyType,
          author_id: resolvedIndexUser.user_profile_id,
          pursuit_category: pursuitCategory,
          cover_photo_url: coverPhotoURL,
          post_format: postType,
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

    // indexUser.following_feed.push(post);
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
      indexUser.save().catch(err => res.status(500).json('Error: ' + err));
      user.save().catch(err => res.status(500).json('Error: ' + err));
      post.save(
        () => {
          userRelation.Model.findById(followerArrayID)
            .then(
              (userRelationResult) => {
                //INSERT CODE TO PUSH TO FRIENDS
                //ADD THE PROMISE INTO THE INDEXUSER.FINDBYID
                const promisedFollowers = userRelationResult.followers.map(
                  id => new Promise((resolve) => {
                    IndexUser.findById(id).then(user => resolve(user));
                  }));
                const foundFollowersResolved = Promise.all(promisedFollowers);
                foundFollowersResolved.then(
                  (userArray) => {
                    //resolved users
                    const promisedUpdatedFollowerArray = userArray.map(
                      indexUser => new Promise((resolve) => {
                        indexUser.following_feed.push(post);
                        indexUser.save().then(() => resolve());
                      })
                    );
                    Promise.all(promisedUpdatedFollowerArray).then((result) => {
                      console.log("Finished!");
                      console.log(result);
                    });
                    // Promise.all()
                  }
                )
              }
            )
        }
      )
    })
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
