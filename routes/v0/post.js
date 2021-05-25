const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Post = require("../../models/post.model");
const PostPreview = require("../../models/post.preview.model");
const Comment = require("../../models/comment.model");
const MulterHelper = require('../../constants/multer');
const {
  findPostInList,
  retrieveUserPreviewByUsername,
  retrieveIndexUserByID,
  retrieveUserByID,
  retrieveUserRelationByID,
  findUserPreviewByIDList,
  retrieveIndexUserByList,
  deletePostByID,
  deleteCommentsByID,
  retrievePostByID,
  updatePostUserDisplayPhoto
} = require('../../data_access/dal');
const RECENT_POSTS_LIMIT = 5;
const { SHORT, LONG } = require("../../constants/flags");
const { validateBodyUsername,
  validateBodyPostPrivacy,
  validateBodyPostType,
  validateBodyIsMilestone,
  validateBodyIsPaginated,
  validateBodyPostID,
  validateBodyIndexUserID,
  validateBodyUserID,
  validateQueryPostID,
  validateQueryIncludePostText,
  validateQueryTextOnly,
  validateBodyImageKey,
  validateQueryPostIDList,
  doesValidationErrorExist,
  validateBodyRemoveCoverPhoto,
} = require('../../utils/validators');
const { checkStringBoolean } = require('../../utils/helper');

const postImageFields = [
  { name: "images" },
  { name: "coverPhoto", maxCount: 1 }];

const setRecentPosts = (post, inputRecentPosts) => {
  let newRecentPosts = inputRecentPosts;
  newRecentPosts.unshift(post);

  if (newRecentPosts.length > RECENT_POSTS_LIMIT) {
    newRecentPosts.pop();
  }

  return newRecentPosts;
}

const updateAllPostsInfo = (pursuits, pursuitCategory, minDuration, isMilestone) => {
  if (!pursuitCategory) return;
  for (const pursuit of pursuits) {
    if (pursuit.name === pursuitCategory) {
      if (isMilestone) { pursuit.num_milestones -= 1; }
      if (minDuration) { pursuit.total_min -= pursuit.minDuration; }
      pursuit.num_posts -= 1;
    }
  }
}

const setPursuitAttributes = (isMilestone, pursuit, minDuration, postID, date) => {
  if (isMilestone) {
    pursuit.num_milestones = Number(pursuit.num_milestones) + 1;
  }

  if (postID) {
    date ? (
      insertIntoDatedPosts(pursuit.dated_posts, postID, date))
      :
      (pursuit.undated_posts.unshift(postID));

    pursuit.all_posts.unshift(postID);
  }

  pursuit.total_min = Number(pursuit.total_min) + minDuration;
  pursuit.num_posts = Number(pursuit.num_posts) + 1;
}

const insertIntoDatedPosts = (datedPosts, postID, date) => {
  datedPosts.unshift(new PostPreview.Model({
    post_id: postID,
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


const findPosts = (postIDList, includePostText) => {
  return findPostInList(postIDList)
    .then(
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

const countComments = (postIDList) => {
  let transformedPostIDArray = [];
  for (let postID of postIDList) {
    transformedPostIDArray.push(mongoose.Types.ObjectId(postID));
  }
  return Comment.Model.aggregate([
    {
      $match: {
        "parent_post_id": { $in: transformedPostIDArray },
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

const retrieveRelevantUserInfo = (req, res, next) => {
  return retrieveUserPreviewByUsername(req.body.username)
    .then((resolvedUserPrevew) =>
      retrieveIndexUserByID(resolvedUserPrevew.parent_index_user_id))
    .then((result) => {
      req.indexUser = result;
    })
    .then(() =>
      Promise.all([
        retrieveUserByID(req.indexUser.user_profile_id),
        retrieveUserRelationByID(req.indexUser.user_relation_id)
      ])
    )
    .then((results) => {
      req.completeUser = results[0];
      req.userRelation = results[1];
      next();
    })
    .catch(next);
};

const createPost = (postType, username, title, subtitle, postPrivacyType, date, authorID,
  pursuitCategory, displayPhoto, coverPhotoKey, postFormat, isPaginated, isMilestone,
  imageData, textSnippet, textData, minDuration, difficulty) => {
  switch (postType) {
    case (SHORT):
      return new Post.Model({
        username: username,
        title: title,
        post_privacy_type: postPrivacyType,
        date: date,
        author_id: authorID,
        pursuit_category: pursuitCategory,
        display_photo_key: displayPhoto,
        cover_photo_key: coverPhotoKey,
        post_format: postFormat,
        is_paginated: isPaginated,
        is_milestone: isMilestone,
        image_data: imageData,
        text_snippet: textSnippet,
        text_data: textData,
        min_duration: minDuration,
        difficulty: difficulty
      });
    case (LONG):
      return new Post.Model({
        username: username,
        title: title,
        subtitle: subtitle,
        post_privacy_type: postPrivacyType,
        author_id: authorID,
        pursuit_category: pursuitCategory,
        display_photo_key: displayPhoto,
        cover_photo_key: coverPhotoKey,
        post_format: postFormat,
        is_paginated: isPaginated,
        is_milestone: isMilestone,
        text_snippet: textSnippet,
        text_data: textData,
        min_duration: minDuration,
        difficulty: difficulty
      });
    default:
      throw new Error("No post type matched.");
  }
}

router.route('/').post(
  MulterHelper.contentImageUpload.fields(postImageFields),
  validateBodyUsername,
  validateBodyPostPrivacy,
  validateBodyPostType,
  validateBodyIsMilestone,
  validateBodyIsPaginated,
  doesValidationErrorExist,
  retrieveRelevantUserInfo,
  (req, res, next) => {
    const postType = req.body.postType;
    const username = req.body.username;
    const postPrivacyType = req.body.postPrivacyType;
    const isMilestone = checkStringBoolean(req.body.isMilestone);
    const isPaginated = checkStringBoolean(req.body.isPaginated);
    const displayPhoto = req.body.displayPhoto;
    const difficulty = req.body.difficulty ? req.body.difficulty : null;
    const title = req.body.title ? req.body.title : null;
    const subtitle = req.body.subtitle ? req.body.subtitle : null;
    const pursuitCategory = req.body.pursuit ? req.body.pursuit : null;
    const date = req.body.date ? new Date(req.body.date) : null;
    const textData = req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const coverPhotoKey = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const imageData = req.files && req.files.images ? getImageUrls(req.files.images) : [];
    const textSnippet = textData ? makeTextSnippet(postType, isPaginated, textData) : null;
    const indexUser = req.indexUser;
    let post = createPost(
      postType,
      username,
      title,
      subtitle,
      postPrivacyType,
      date,
      indexUser.user_profile_id,
      pursuitCategory,
      displayPhoto,
      coverPhotoKey,
      postType,
      isPaginated,
      isMilestone,
      imageData,
      textSnippet,
      textData,
      minDuration,
      difficulty
    );

    if (indexUser.preferred_post_privacy !== postPrivacyType) {
      indexUser.preferred_post_privacy = postPrivacyType;
    }

    if (minDuration) {
      for (const pursuit of indexUser.pursuits) {
        if (pursuit.name === pursuitCategory) {
          setPursuitAttributes(isMilestone, pursuit, minDuration);
          break;
        }
      }
    }

    indexUser.recent_posts = setRecentPosts(post, indexUser.recent_posts);

    const user = req.completeUser;
    user.all_posts.unshift(post._id);
    if (date) {
      insertIntoDatedPosts(user.dated_posts, post._id, date);
    }
    else {
      throw new BadRequestError(NO_DATE_FOUND)
    }

    if (pursuitCategory) {
      for (const pursuit of user.pursuits) {
        if (pursuit.name === pursuitCategory) {
          setPursuitAttributes(isMilestone, pursuit, minDuration, post._id, date);
          break;
        }
      }
    }
    const savedIndexUser = indexUser
      .save()
      .catch(error => {
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
    return Promise.all([savedIndexUser, savedUser, savedPost])
      .then(() => next());

  }, (req, res, next) => {

    let followersIDArray = [];
    for (const user of req.userRelation.followers) {
      followersIDArray.push(user.user_preview_id);
    }
    return findUserPreviewByIDList(followersIDArray)
      .then((result) => {
        if (result) {
          let indexUserIDArray = []
          for (const previewedUser of result) {
            indexUserIDArray.push(previewedUser.parent_index_user_id);
          }
          return retrieveIndexUserByList(indexUserIDArray);
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
              res.status(201).send("Feel Free to continue browsing as we push updates")
            });
        }
      )
      .catch(next);
  })
  .put(
    MulterHelper.contentImageUpload.single("coverPhoto"),
    validateBodyPostID,
    validateBodyUsername,
    validateBodyPostType,
    validateBodyIsMilestone,
    validateBodyIsPaginated,
    validateBodyRemoveCoverPhoto,
    doesValidationErrorExist,
    (req, res, next) => {
      const postID = req.body.postID;
      const postType = req.body.postType;
      const username = req.body.username;
      const isMilestone = checkStringBoolean(req.body.isMilestone);
      const isPaginated = checkStringBoolean(req.body.isPaginated);
      const difficulty = req.body.difficulty ? req.body.difficulty : null;
      const postPrivacyType = req.body.postPrivacyType ? req.body.postPrivacyType : null;
      const title = !!req.body.title ? req.body.title : null;
      const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
      const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
      const date = !!req.body.date ? req.body.date : null;
      const textData = !!req.body.textData ? req.body.textData : null;
      const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
      const coverPhotoKey = req.file ? req.file.key : null;
      const removeCoverPhoto = checkStringBoolean(req.body.removeCoverPhoto);
      return retrievePostByID(postID)
        .then(
          (result) => {
            let post = result;
            if (post.post_privacy_type) {
              post.post_privacy_type = postPrivacyType;
            }
            if (removeCoverPhoto) {
              post.cover_photo_key = null;
            }
            else if (coverPhotoKey) {
              post.cover_photo_key = coverPhotoKey;
            }
            post.difficulty = difficulty;
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
            return post.save()
          })
        .then(() => {
          return res.status(200).send();
        })
        .catch(next)
    })
  .delete(
    validateBodyIndexUserID,
    validateBodyUserID,
    validateBodyPostID,
    validateBodyIsMilestone,
    doesValidationErrorExist,
    (req, res, next) => {
      const indexUserID = req.body.indexUserID;
      const userID = req.body.userID;
      const postID = req.body.postID;
      const pursuitCategory = req.body.pursuit;
      const minDuration = req.body.minDuration;
      const isMilestone = checkStringBoolean(req.body.isMilestone);
      const resolvedIndexUser =
        retrieveIndexUserByID(indexUserID)
          .then((indexUser) => {
            let updatedRecentPosts = [];
            for (const post of indexUser.recent_posts) {
              if (post._id.toString() !== postID) {
                updatedRecentPosts.unshift(post);
              }
            }
            indexUser.recent_posts = updatedRecentPosts;
            updateAllPostsInfo(indexUser.pursuits, pursuitCategory, minDuration, isMilestone)

            return indexUser.save();
          })
          .catch(next);

      const resolvedUser = retrieveUserByID(userID)
        .then((user) => {
          let updatedAllPosts = [];
          for (const post of user.all_posts) {
            if (post.toString() !== postID) {
              updatedAllPosts.unshift(post);
            }
          }
          user.all_posts = updatedAllPosts;
          updateAllPostsInfo(user.pursuits, pursuitCategory, minDuration, isMilestone)

          return user.save();
        })
        .catch((error) => {
          throw new Error(error, "Something went wrong resolving user")
        });

      return Promise.all([resolvedIndexUser, resolvedUser, Post.Model.findById(postID)])
        .then((results) => {
          console.log(results[2]);
          if (results[2].comments.length === 0) return deletePostByID(postID);
          return Promise.all([
            deletePostByID(postID),
            deleteCommentsByID(results[2].comments)
          ])
        })
        .then(() => res.status(204).send())
        .catch(next);
    });

router.route('/multiple').get(
  validateQueryPostIDList,
  validateQueryIncludePostText,
  doesValidationErrorExist,
  (req, res, next) => {
    const postIDList = req.query.postIDList;
    const includePostText = req.query.includePostText;
    return Promise.all([
      findPosts(postIDList, includePostText),
      countComments(postIDList)])
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
      .catch(next)
  });

router.route('/single').get(
  validateQueryTextOnly,
  validateQueryPostID,
  doesValidationErrorExist,
  (req, res, next) => {
    const textOnly = req.query.textOnly.toUpperCase();
    const postID = req.query.postID;
    return retrievePostByID(postID)
      .then(result => {
        if (textOnly === "TRUE") {
          return res.status(200).send(result.text_data);
        }
        else {
          return res.status(200).send(result);
        }
      })
      .catch(next);
  })

router.route('/display-photo')
  .patch(
    validateBodyUsername,
    validateBodyImageKey,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const imageKey = req.body.imageKey;
      return updatePostUserDisplayPhoto(username, imageKey)
        .then(() => {
          return res.status(200).send();
        })
        .catch(next)
    })
module.exports = router;
