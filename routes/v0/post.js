const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');
const Post = require("../../models/post.model");
const PostPreview = require("../../models/post.preview.model");
const multer = require('multer');
const AWS = require('aws-sdk');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3');
const uuid = require('uuid');
const userRelation = require('../../models/user.relation.model');

const SHORT = "SHORT";
const RECENT_POSTS_LIMIT = 8;

const s3 = new AWS.S3({
  accessKeyId: AwsConstants.ID,
  secretAccessKey: AwsConstants.SECRET
});

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

    const postType = !!req.body.postType ? req.body.postType : null;
    const username = req.body.username;
    const displayPhoto = req.body.displayPhoto;
    const title = !!req.body.title ? req.body.title : null;
    const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
    const postPrivacyType = !!req.body.postPrivacyType ? req.body.postPrivacyType : null;
    const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
    const date = !!req.body.date ? new Date(req.body.date) : null;
    const textData = !!req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const isMilestone = Boolean.prototype.valueOf(req.body.isMilestone);
    const isPaginated = Boolean.prototype.valueOf(req.body.isPaginated);
    const coverPhotoURL = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].location : null;
    const imageData = req.files && req.files.images ? getImageUrls(req.files.images) : [];

    let post = null;
    let indexUser = null;
    let followerArrayID = null;
    let textSnippet = null;

    if (textData) {
      textSnippet = makeTextSnippet(postType, isPaginated, textData)
    }

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
      resolvedIndexUser.recent_posts.unshift(post._id);
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
        user.all_posts.unshift(post._id);
        if (date) {
          insertIntoDatedPosts(user.dated_posts, post._id, date);
          console.log(user.dated_posts);
        }
        else {
          user.undated_posts.unshift(post._id);
          console.log(user.undated_posts);
        }
        // user.recent_posts.unshift(post);
        // if (user.recent_posts.length > RECENT_POSTS_LIMIT) {
        //   user.recent_posts.shift();
        //   console.log("Removed oldest post.");
        // }
        //check if pursuits exists already
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
          //INSERT CODE TO PUSH TO FRIENDS
          //ADD THE PROMISE INTO THE INDEXUSER.FINDBYID
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
          //resolved users
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
    console.log("Hit");
    console.log(req.body);
    console.log(req.files);

    const postId = !!req.body.postId ? req.body.postId : null;

    const postType = !!req.body.postType ? req.body.postType : null;
    const username = req.body.username;
    const displayPhoto = req.body.displayPhoto;
    const title = !!req.body.title ? req.body.title : null;
    const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
    // const postPrivacyType = !!req.body.postPrivacyType ? req.body.postPrivacyType : null;
    const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
    const date = !!req.body.date ? req.body.date : null;
    const textData = !!req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const isMilestone = !!req.body.isMilestone ? req.body.isMilestone : null;
    const isPaginated = req.body.isPaginated ? true : false;
    const coverPhotoURL = req.files ? req.files.coverPhoto[0].location : null;
    console.log(textData);

    return Post.Model.findById(postId)
      .then(
        (result) => {
          let post = result;
          post.username = username;
          post.displayPhoto = displayPhoto;
          post.title = title;
          post.subtitle = subtitle;
          post.pursuitCategory = pursuitCategory;
          post.date = date;
          post.minDuration = minDuration;
          post.isMilestone = isMilestone;
          post.isPaginated = isPaginated;
          post.coverPhotoURL = coverPhotoURL;
          post.textData = textData;
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
    console.log("Hit");
    console.log(req.body.indexUserId);
    res.status(200).send();
    const indexUserId = req.body.indexUserId;
    const userId = req.body.userId;
    const postId = req.body.postId;
    let returnedUser = null;
    let returnedIndexUser = null;
    const resolvedIndexUser = IndexUser.Model.findById(indexUserId)
      .then((user) => {
        returnedUser = user;
        console.log(user);
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
  console.log(postIdList);
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
          // coverInfoArray.unshift(
          result.text_data = "";
          result.feedback = "";
          console.log(result.text_data);

        }
      }
      console.log(coverInfoArray);
      res.status(200).send(coverInfoArray);
    })
});

// router.route('/feed').get((req, res) => {
//   const indexUserId = req.query.indexUserId;
//   const postIdList = req.query.postIdList;
//   console.log(postIdList);
//   let updatedPostIdList = [];
//   let posts = null;
//   return Post.Model.find({
//     '_id': { $in: postIdList }, function(err, docs) {
//       if (err) console.log(err);
//       else {
//         console.log(docs);
//       }
//     }
//   }).then(
//     (result) => {
//       console.log(result);
//       posts = result;
//       if (result.length !== postIdList) {
//         for (const post of result) {
//           if (postIdList.includes(post._id.toString())) updatedPostIdList.unshift(post._id.toString());
//         }
//         return IndexUser.Model.findById(indexUserId).then(
//           (indexUser) => {
//             indexUser.following_feed = updatedPostIdList;
//             return indexUser.save();
//           }
//         );
//       }
//       return;
//     }
//   )
//     .then(() => res.status(200).json({ feed: posts }))
//     .catch((err) => {
//       console.log(err);
//       res.status(500).send();
//     })


// });

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
