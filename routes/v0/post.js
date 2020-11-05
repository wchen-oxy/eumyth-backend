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

const RECENT_POSTS_LIMIT = 8;

const setPursuitAttributes = (isMilestone, pursuit, minDuration) => {
  if (isMilestone) { pursuit.num_milestones = Number(pursuit.num_milestones) + 1; }
  pursuit.total_min = Number(pursuit.total_min) + minDuration;
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
    imageArray.push(imageFile.location);
  }
  return imageArray;
}

router.route('/')
  .put(upload.fields([{ name: "images" }, { name: "coverPhoto", maxCount: 1 }]), (req, res) => {

    const postType = !!req.body.postType ? req.body.postType : null;
    const username = req.body.username;
    const displayPhoto = req.body.displayPhoto;
    const title = !!req.body.title ? req.body.title : null;
    const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
    const postPrivacyType = !!req.body.postPrivacyType ? req.body.postPrivacyType : null;
    const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
    const date = !!req.body.date ? req.body.date : null;
    const textData = !!req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const isMilestone = !!req.body.isMilestone ? req.body.isMilestone : null;
    const isPaginated = req.body.isPaginated ? true : false;
    const coverPhotoURL = req.files.coverPhoto ? req.files.coverPhoto[0].location : null;
    const imageData = req.files.images ? getImageUrls(req.files.images) : [];

    let post = null;
    let indexUser = null;
    let followerArrayID = null;
    let textSnippet = null;

    if (textData) {
      if (postType === "SHORT") {
        if (isPaginated) {
          textSnippet = textData[0].length > 140 ? textData[0].substring(0, 140).trim() + "..." : textData[0];
        }
        else {
          textSnippet = textData.length > 140 ? textData.substring(0, 140).trim() + "..." : textData;
        }
      }
      else {
        const completeText = JSON.parse(textData).blocks[0].text;
        textSnippet = completeText.length > 140 ? completeText.substring(0, 140).trim() + "..." : completeText.trim();
      }
    }

    console.log(textSnippet);

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
            username: username,
            title: title,
            private: postPrivacyType,
            date: date,
            author_id: resolvedIndexUser.user_profile_id,
            pursuit_category: pursuitCategory,
            display_photo_url: displayPhoto,
            cover_photo_url: coverPhotoURL,
            post_format: postType,
            is_paginated: isPaginated,
            is_milestone: isMilestone,
            image_data: imageData,
            text_snippet: textSnippet,
            text_data: textData,
            min_duration: minDuration
          });
          break;
        case ("LONG"):
          post = new Post.Model({
            username: username,
            title: title,
            subtitle: subtitle,
            private: postPrivacyType,
            author_id: resolvedIndexUser.user_profile_id,
            pursuit_category: pursuitCategory,
            display_photo_url: displayPhoto,
            cover_photo_url: coverPhotoURL,
            post_format: postType,
            is_paginated: isPaginated,
            is_milestone: isMilestone,
            text_snippet: textSnippet,
            text_data: textData,
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
      resolvedIndexUser.recent_posts.push(post._id);
      if (resolvedIndexUser.recent_posts.length > RECENT_POSTS_LIMIT) resolvedIndexUser.recent_posts.shift();
      return resolvedIndexUser.user_profile_id;
    }
    );

    //modify new post array for User
    let resolvedUser = resolveNewPost.then(
      (result) => {
        return User.Model.findById(result);
      }
    );
    resolvedUser.then(
      resolvedUser => {
        const user = resolvedUser;
        user.all_posts.push(post._id);
        // user.recent_posts.push(post);
        // if (user.recent_posts.length > RECENT_POSTS_LIMIT) {
        //   user.recent_posts.shift();
        //   console.log("Removed oldest post.");
        // }
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
        const savedIndexUser = indexUser.save().catch(err => {
          if (err) {
            console.log(err);
            res.status(500).json('Error: ' + err);
          }
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
          return userRelation.Model.findById(followerArrayID)

        }
      )
      .then(
        (userRelationResult) => {
          //INSERT CODE TO PUSH TO FRIENDS
          //ADD THE PROMISE INTO THE INDEXUSER.FINDBYID
          if (userRelationResult) {
            let followersIdArray = [];
            for (const user of userRelationResult.followers) {
              followersIdArray.push(user.id);
            }
            return IndexUser.Model.find({
              '_id': { $in: followersIdArray }, function(err, docs) {
                if (err) console.log(err);
                else {
                  console.log(docs);
                }
              }
            });
          }
          else {
            Promise.reject("Unable to push new posts to followers because User Relation was not found.");
          }
        }
      )
      .then(
        (userArray) => {
          //resolved users
          const promisedUpdatedFollowerArray = userArray.map(
            indexUser => new Promise((resolve) => {
              indexUser.following_feed.push(post._id);
              if (indexUser.following_feed.length > 50) {
                indexUser.following_feed.shift();
                console.log("Removed oldest post from a user's following feed");
              }
              indexUser.save().then(() => resolve("saved"));
            })
          );
          return Promise.all(promisedUpdatedFollowerArray).then((result) => {
            console.log("Finished!");
            console.log(result);
            res.status(201).send("Feel Free to continue browsing as we push updates")
          });
        }
      ).
      catch(
        (err) => {
          console.log(err);
          res.status(500).json(err);
        }
      )

  })
  .delete((req, res) => {
    const userId = req.body.userId;
    const postId = req.body.postId;
    let returnedUser = null;

    return User.Model.findById(userId)
      .then((user) => {
        returnedUser = user;
        let updatedAllPosts = [];
        let updatedRecentPosts = [];
        for (const post of user.all_posts) {
          if (post.toString() !== postId) {
            updatedAllPosts.push(post);
          }
        }
        for (const post of user.recent_posts) {
          if (post._id.toString() !== postId) {
            updatedRecentPosts.push(post);
          }
        }
        returnedUser.all_posts = updatedAllPosts;
        returnedUser.recent_posts = updatedRecentPosts;

        return Post.Model.deleteOne({ _id: postId });
      })
      .then(() => {
        return returnedUser.save();
      })
      .then(() => res.status(204).send())
      .catch((err) => console.log(err));
  });

router.route('/multiple').get((req, res) => {
  const postIdList = req.query.postIdList;
  console.log(postIdList);
  return Post.Model.find({
    '_id': { $in: postIdList }, function(err, docs) {
      if (err) console.log(err);
      else {
        console.log(docs);
      }
    }
  }).then(
    (results) => {
      let coverInfoArray = results;
      console.log(coverInfoArray);
      for (result of coverInfoArray) {
        // coverInfoArray.push(
          result.text_data = "";
          result.feedback = "";
          console.log(result.text_data);
        
      }
      console.log(coverInfoArray);
      res.status(200).send(coverInfoArray);
    })
});

router.route('/feed').get((req, res) => {
  const indexUserId = req.query.indexUserId;
  const postIdList = req.query.postIdList;
  console.log("ewr");
  console.log(postIdList);
  let updatedPostIdList = [];
  let posts = null;
  return Post.Model.find({
    '_id': { $in: postIdList }, function(err, docs) {
      if (err) console.log(err);
      else {
        console.log(docs);
      }
    }
  }).then(
    (result) => {
      console.log(result);
      posts = result;
      if (result.length !== postIdList) {
        for (const post of result) {
          if (postIdList.includes(post._id.toString())) updatedPostIdList.push(post._id.toString());
        }
        return IndexUser.Model.findById(indexUserId).then(
          (indexUser) => {
            indexUser.following_feed = updatedPostIdList;
            return indexUser.save();
          }
        );
      }
      return;
    }
  )
    .then(() => res.status(200).json({ feed: posts }))
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    })


});

router.route('/single-text').get((req, res) => {
  return Post.Model.findById(req.query.postId)
  .then(result => {
    res.status(200).send(result.text_data);
  })
  .catch(err => {
    console.log(err);
    res.status(500).send("No Post Found");
  })
})

module.exports = router;
