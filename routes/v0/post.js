const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const AWSConstants = require('../../constants/aws');

const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');
const Post = require("../../models/post.model");
const PostPreview = require("../../models/post.preview.model");
const UserPreview = require("../../models/user.preview.model");
const Comment = require("../../models/comment.model");
const UserRelation = require('../../models/user.relation.model');
const MulterHelper = require('../../constants/multer');
const RECENT_POSTS_LIMIT = 5;
const SHORT = "SHORT";
const LONG = "LONG";

const postImageFields = [{ name: "images" }, { name: "coverPhoto", maxCount: 1 }];

// const retrieveImage = () => {
//   if ()
// }

const setRecentPosts = (post, inputRecentPosts) => {
  let newRecentPosts = inputRecentPosts;
  newRecentPosts.unshift(post);

  if (newRecentPosts.length > RECENT_POSTS_LIMIT) {
    newRecentPosts.pop();
  }

  return newRecentPosts;
}

const setPursuitAttributes = (isMilestone, pursuit, minDuration, postId, date) => {
  if (isMilestone) {
    pursuit.num_milestones = Number(pursuit.num_milestones) + 1;
  }

  if (postId) {
    date ? (
      insertIntoDatedPosts(pursuit.dated_posts, postId, date))
      :
      (pursuit.undated_posts.unshift(postId));

    pursuit.all_posts.unshift(postId);
  }

  pursuit.total_min = Number(pursuit.total_min) + minDuration;
  pursuit.num_posts = Number(pursuit.num_posts) + 1;
  // return pursuit;
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
      return (textData[0].length > 140
        ? (textData[0].substring(0, 140).trim()) + "..."
        : textData[0]);
    }
    else {
      return (textData.length > 140
        ? textData.substring(0, 140).trim() + "..."
        : textData);
    }
  }
  else {
    const completeText = JSON.parse(textData).blocks[0].text;

    return completeText.length > 140
      ? completeText.substring(0, 140).trim() + "..."
      : completeText.trim();
  }
}


const findPosts = (postIdList, includePostText) => {
  return Post.Model.find({
    '_id': { $in: postIdList }, function(error, docs) {
      if (error) console.log(error);
      else {
        console.log(docs);
      }
    }
  }).sort({ createdAt: -1 }).lean().then(
    (results) => {
      let coverInfoArray = results;
      if (!includePostText) {
        for (result of coverInfoArray) {
          result.text_data = "";
          result.feedback = "";
        }
      }
      return coverInfoArray;
    })

}

const countComments = (postIdList) => {
  let transformedPostIdArray = [];
  for (let postId of postIdList) {
    transformedPostIdArray.push(mongoose.Types.ObjectId(postId));
  }
  console.log("Counting", transformedPostIdArray);
  return Comment.Model.aggregate([
    {
      $match: {
        "parent_post_id": { $in: transformedPostIdArray },
      }
    },
    {
      $group: {
        "_id": "$parent_post_id",
        "comment_count": { $sum: 1 },
      }
    },
    {
      $group: {
        "_id": "",
        "data": {
          $mergeObjects: {
            $arrayToObject: [[{ k: { $toString: "$_id" }, v: "$comment_count" }]]
          }
        }
      }
    },
    {
      $replaceRoot: { newRoot: "$data" }
    }

  ])
}


router.route('/')
  .post(MulterHelper.contentImageUpload.fields(postImageFields), (req, res) => {
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
    const isMilestone = req.body.isMilestone.trim().toLowerCase() === 'true';
    const isPaginated = req.body.isPaginated.trim().toLowerCase() === 'true';
    const coverPhotoKey = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const imageData = req.files && req.files.images ? getImageUrls(req.files.images) : [];
    let post = null;
    let indexUser = null;
    let followerArrayID = null;
    let userRelationResult = null;
    let textSnippet = null;

    if (textData) {
      textSnippet = makeTextSnippet(postType, isPaginated, textData)
    }

    return UserPreview.Model
      .findOne({ username: username })
      .then((resolvedUserPrevew) => (
        IndexUser.Model.findById(resolvedUserPrevew.parent_index_user_id)))
      .then(resolvedIndexUser => {
        indexUser = resolvedIndexUser;
        followerArrayID = indexUser.user_relation_id;

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
            throw new Error("No post type matched.");
        }

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
        indexUser.recent_posts = setRecentPosts(post, resolvedIndexUser.recent_posts);
        return;
      })
      .then(() => (Promise.all([
        User.Model.findById(indexUser.user_profile_id),
        UserRelation.Model.findById(followerArrayID)])))
      .then(results => {
        const user = results[0];
        userRelationResult = results[1];
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
      })
      .then(user => {
        const savedIndexUser = indexUser.save().catch(error => {
          if (error) {
            console.log(error);
            res.status(500).json('Error: ' + error);
          }
        });
        const savedUser = user.save().catch(error => {
          if (error) {
            console.log(error);
            res.status(500).json('Error: ' + error);
          }
        });
        const savedPost = post.save().catch(error => {
          if (error) {
            console.log(error);
            res.status(500).json('Error: ' + error);
          }
        });
        return Promise.all([savedIndexUser, savedUser, savedPost]);
      })
      .then(() => {
        if (userRelationResult) {
          let followersIdArray = [];
          for (const user of userRelationResult.followers) {
            followersIdArray.push(user.user_preview_id);
          }
          return UserPreview.Model.find({
            '_id': { $in: followersIdArray }, function(error, docs) {
              if (error) console.log(error);
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
      .then((result) => {
        if (result) {
          let indexUserIdArray = []
          for (const previewedUser of result) {
            indexUserIdArray.push(previewedUser.parent_index_user_id);
          }
          return IndexUser.Model.find({
            '_id': { $in: indexUserIdArray }, function(error, docs) {
              if (error) console.log(error);
              else {
                console.log(docs);
              }
            }
          });
        }
        else {
          throw new Error(500);
        }
      })
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
          return Promise.all(promisedUpdatedFollowerArray)
            .then((result) => {
              console.log("Finished!");
              console.log(result);
              res.status(201).send("Feel Free to continue browsing as we push updates")
            });
        }
      )
      .catch(
        (error) => {
          if (error.code === 500) console.log("error when pushing new entries to followers")
          console.log(error);
          return res.status(500).json({ error: error });
        }
      );
  })
  .put(MulterHelper.contentImageUpload.single("coverPhoto"), (req, res) => {
    const postId = !!req.body.postId ? req.body.postId : null;
    const postType = req.body.postType ? req.body.postType : null;
    const username = req.body.username;
    const title = !!req.body.title ? req.body.title : null;
    const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
    const postPrivacyType = !!req.body.postPrivacyType ? req.body.postPrivacyType : null;
    const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
    const date = !!req.body.date ? req.body.date : null;
    const textData = !!req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const isMilestone = !!req.body.isMilestone ? req.body.isMilestone : null; //fixme check if isPaginated works now
    const isPaginated = req.body.isPaginated ? req.body.isPaginated.trim().toLowerCase() === 'true' : false;
    const coverPhotoKey = req.file ? req.file.key : null;
    const removeCoverPhoto = req.body.removeCoverPhoto
      ? req.body.removeCoverPhoto
        .trim()
        .toLowerCase() === 'true' : false;

    return Post.Model.findById(postId)
      .then(
        (result) => {
          let post = result;
          if (removeCoverPhoto) {
            post.cover_photo_key = null;
          }
          else if (coverPhotoKey) {
            post.cover_photo_key = coverPhotoKey;
          }
          post.username = username;
          post.title = title;
          post.subtitle = subtitle;
          post.pursuit_category = pursuitCategory;
          post.date = date;
          post.min_duration = minDuration;
          post.is_milestone = isMilestone;
          post.is_paginated = isPaginated;
          post.text_data = textData;
          post.text_snippet = textData ? makeTextSnippet(postType, isPaginated, textData) : null;
          post.post_privacy_type = postPrivacyType;

          return post.save()
        })
      .then(() => {
        return res.status(200).send();
      })
      .catch(error => {
        console.log(error);
        return res.status(500).json({ error: error })
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
        if (!user) throw new Error(500, "no user found");
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
      .catch((error) => {
        throw new Error(error, "Something went wrong resolving index user")
      });

    const resolvedUser = User.Model.findById(userId)
      .then((user) => {
        if (!user) throw new Error(500, "no user found");
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
        (error) => { throw new Error(error, "Something went wrong resolving user") }
      );
    return Promise.all([resolvedIndexUser, resolvedUser])
      .then(() => Post.Model.deleteOne({ _id: postId }))
      .then(() => res.status(204).send())
      .catch(error => {
        console.log(error);
        return res.status(500).json({ error: error });
      }
      );
  });

router.route('/multiple').get((req, res) => {
  const postIdList = req.query.postIdList;
  const includePostText = req.query.includePostText;
  console.log(postIdList);
  console.log(includePostText);
  return Promise.all([
    findPosts(postIdList, includePostText),
    countComments(postIdList)])
    .then((results) => {
      let posts = results[0];
      if (results[1].length > 0) {
        let commentData = results[1][0];
        for (let post of posts) {
          post.comment_count = commentData[post._id.toString()] ? commentData[post._id.toString()] : 0;
        }
      }
      else {
        for (let post of posts) {
          post.comment_count = 0;
        }
      }
      return res.status(200).json({ posts: posts });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: error });
    })
});

router.route('/single').get((req, res) => {
  const textOnly = req.query.textOnly.toUpperCase();
  const postId = req.query.postId;
  return Post.Model.findById(postId)
    .then(result => {
      if (textOnly === "TRUE") {
        return res.status(200).send(result.text_data);
      }
      else {
        return res.status(200).send(result);
      }
    })
    .catch(error => {
      console.log(error);
      if (error.name === 'CastError') {
        return res.status(500).json({ error: "Malformed Object ID" });
      }
      return res.status(500).json({ error: "No Post Found" });
    });

})

router.route('/display-photo').patch((req, res) => {
  const username = req.body.username;
  const imageKey = req.body.imageKey;
  console.log(imageKey);
  return Post.Model.updateMany({ username: username }, { display_photo_key: imageKey })
    .then(() => {
      return res.status(200).send();
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).send();
    })
})
module.exports = router;
