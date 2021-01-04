const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');
const Post = require("../../models/post.model");
const PostPreview = require("../../models/post.preview.model");
const multer = require('multer');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3');
const uuid = require('uuid');
const userRelation = require('../../models/user.relation.model');
const SHORT = "SHORT";
const LONG = "LONG";
const RECENT_POSTS_LIMIT = 5;

const setPursuitAttributes = (isMilestone, pursuit, minDuration, postId, date) => {
  if (isMilestone) {
    pursuit.num_milestones = Number(pursuit.num_milestones) + 1;
  }

  if (postId) {
    if (date) { insertIntoDatedPosts(pursuit.dated_posts, postId, date) }
    else { pursuit.undated_posts.unshift(postId); }
    pursuit.all_posts.unshift(postId);
  }
  pursuit.total_min = Number(pursuit.total_min) + minDuration;
  pursuit.num_posts = Number(pursuit.num_posts) + 1;
  return pursuit;
}

const insertIntoDatedPosts = (datedPosts, postId, date) => {
  datedPosts.unshift(new PostPreview.Model({
    post_id: postId,
    date: date
  }));
  if (datedPosts.length > 1) {
    datedPosts.sort((a, b) => b.date - a.date);
  }
  return datedPosts;
}

var upload = multer({
  storage: multerS3({
    s3: AwsConstants.S3_INTERFACE,
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
    imageArray.push(imageFile.key);
  }
  return imageArray;
}

const makeTextSnippet = (postType, isPaginated, textData) => {
  if (postType === SHORT) {
    if (isPaginated) {
      return textData[0].length > 140 ? textData[0].substring(0, 140).trim() + "..." : textData[0];
    }
    else {
      return textData.length > 140 ? textData.substring(0, 140).trim() + "..." : textData;
    }
  }
  else {
    const completeText = JSON.parse(textData).blocks[0].text;
    return completeText.length > 140 ? completeText.substring(0, 140).trim() + "..." : completeText.trim();
  }
}

router.route('/')
  .post(upload.fields([{ name: "images" }, { name: "coverPhoto", maxCount: 1 }]), (req, res) => {

    const postType = req.body.postType ? req.body.postType : null;
    const username = req.body.username;
    const displayPhoto = req.body.displayPhoto;
    const title = req.body.title ? req.body.title : null;
    const subtitle = req.body.subtitle ? req.body.subtitle : null;
    const postPrivacyType = req.body.postPrivacyType ? req.body.postPrivacyType : null;
    const pursuitCategory = req.body.pursuitCategory ? req.body.pursuitCategory : null;
    const date = req.body.date ? new Date(req.body.date) : null;
    const textData = req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const isMilestone = Boolean.prototype.valueOf(req.body.isMilestone);
    const isPaginated = Boolean.prototype.valueOf(req.body.isPaginated);
    const coverPhotoKey = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const imageData = req.files && req.files.images ? getImageUrls(req.files.images) : [];

    let post = null;
    let indexUser = null;
    let followerArrayID = null;
    let textSnippet = null;

    if (textData) {
      textSnippet = makeTextSnippet(postType, isPaginated, textData)
    }

    let resolvedNewPost = IndexUser.Model.findOne({ username: username }).then(resolvedIndexUser => {
      indexUser = resolvedIndexUser;
      switch (postType) {
        case (SHORT):
          post = new Post.Model({
            username: username,
            title: title,
            post_privacy_type: postPrivacyType,
            date: date,
            author_id: resolvedIndexUser.user_profile_id,
            pursuit_category: pursuitCategory,
            display_photo_key: displayPhoto,
            cover_photo_key: coverPhotoKey,
            post_format: postType,
            is_paginated: isPaginated,
            is_milestone: isMilestone,
            image_data: imageData,
            text_snippet: textSnippet,
            text_data: textData,
            min_duration: minDuration
          });
          break;
        case (LONG):
          post = new Post.Model({
            username: username,
            title: title,
            subtitle: subtitle,
            post_privacy_type: postPrivacyType,
            author_id: resolvedIndexUser.user_profile_id,
            pursuit_category: pursuitCategory,
            display_photo_key: displayPhoto,
            cover_photo_key: coverPhotoKey,
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
      followerArrayID = indexUser.user_relation_id;
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
      let newRecentPosts = resolvedIndexUser.recent_posts;
      console.log(newRecentPosts, "BEFORE");
      newRecentPosts.unshift(post);
      if (newRecentPosts.length > RECENT_POSTS_LIMIT) {
        newRecentPosts.pop();
      }
      indexUser.recent_posts = newRecentPosts;
      return indexUser.user_profile_id;
    }
    );

    let resolvedUser = resolvedNewPost.then(
      (result) => {
        return User.Model.findById(result);
      }
    );
    resolvedUser.then(
      resolvedUser => {
        const user = resolvedUser;
        user.all_posts.unshift(post._id);
        if (date) {
          insertIntoDatedPosts(user.dated_posts, post._id, date);
          console.log(user.dated_posts);
        }
        else {
          user.undated_posts.unshift(post._id);
        }

        if (pursuitCategory) {
          for (const pursuit of user.pursuits) {
            if (pursuit.name === pursuitCategory) {
              setPursuitAttributes(isMilestone, pursuit, minDuration, post._id, date);
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

          if (userRelationResult) {
            let followersIdArray = [];
            for (const user of userRelationResult.followers) {
              followersIdArray.unshift(user.id);
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
          const promisedUpdatedFollowerArray = userArray.map(
            indexUser => new Promise((resolve) => {
              indexUser.following_feed.unshift(post._id);
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
  .put(upload.single({ name: "coverPhoto", maxCount: 1 }), (req, res) => {
    const postId = !!req.body.postId ? req.body.postId : null;
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
    const coverPhotoKey = req.files ? req.files.coverPhoto[0].key : null;

    return Post.Model.findById(postId)
      .then(
        (result) => {
          let post = result;
          post.username = username;
          post.display_photo_key = displayPhoto;
          post.title = title;
          post.subtitle = subtitle;
          post.pursuit_category = pursuitCategory;
          post.date = date;
          post.min_duration = minDuration;
          post.is_milestone = isMilestone;
          post.is_paginated = isPaginated;
          post.cover_photo_key = coverPhotoKey;
          post.text_data = textData;
          post.post_privacy_type = postPrivacyType;
          return post.save()
            .catch(err => {
              if (err) {
                console.log(err);
                res.status(500).json('Error: ' + err);
              }
            });;
        }
      )
      .then(
        () => {
          return res.status(200).send();
        }
      )
      .catch(err => {
        console.log(err);
        res.status(500).send()
      })
  })
  .delete((req, res) => {
    const indexUserId = req.body.indexUserId;
    const userId = req.body.userId;
    const postId = req.body.postId;
    let returnedUser = null;
    let returnedIndexUser = null;
    const resolvedIndexUser = IndexUser.Model.findById(indexUserId)
      .then((user) => {
        returnedUser = user;
        let updatedRecentPosts = [];

        for (const post of user.recent_posts) {
          if (post._id.toString() !== postId) {
            updatedRecentPosts.unshift(post);
          }
        }
        returnedIndexUser.recent_posts = updatedRecentPosts;
        return returnedIndexUser.save();
      })
      .catch(
        (err) => console.log(err)
      );
    const resolvedUser = User.Model.findById(userId)
      .then((user) => {
        returnedUser = user;
        let updatedAllPosts = [];
        for (const post of user.all_posts) {
          if (post.toString() !== postId) {
            updatedAllPosts.unshift(post);
          }
        }
        returnedUser.all_posts = updatedAllPosts;
        return returnedUser.save();
      })
      .catch(
        (err) => console.log(err)
      );
    return Promise.all([resolvedIndexUser, resolvedUser]).then((result) => Post.Model.deleteOne({ _id: postId }))
      .then((result) => res.status(204).send())
      .catch(err => {
        console.log(err);
        res.status(500).send();
      }
      );
  });

router.route('/multiple').get((req, res) => {
  const postIdList = req.query.postIdList;
  const includePostText = req.query.includePostText;
  return Post.Model.find({
    '_id': { $in: postIdList }, function(err, docs) {
      if (err) console.log(err);
      else {
        console.log(docs);
      }
    }
  }).sort({ createdAt: -1 }).then(
    (results) => {
      let coverInfoArray = results;
      console.log(coverInfoArray);
      if (!includePostText) {
        for (result of coverInfoArray) {
          result.text_data = "";
          result.feedback = "";
        }
      }
      console.log(coverInfoArray);
      console.log("This way");
      return res.send(coverInfoArray);
    })
});

router.route('/single').get((req, res) => {
  const textOnly = req.query.textOnly.toUpperCase();
  const postId = req.query.postId;
  console.log(textOnly);
  return Post.Model.findById(postId)
    .then(result => {
      if (textOnly === "TRUE") {
        res.status(200).send(result.text_data);
      }
      else {
        console.log(result);
        res.status(200).send(result);
      }
    })
    .catch(err => {
      console.log(err);
      if (err.name === 'CastError') {
        return res.status(500).send("Malformed Object ID");
      }
      res.status(500).send("No Post Found");
    });

})

module.exports = router;
