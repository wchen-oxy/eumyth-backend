const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Post = require("../../models/post.model");
const ContentPreview = require("../../models/content.preview.model");
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

const { BadRequestError } = require("../../utils/errors");
const RECENT_POSTS_LIMIT = 5;
const { SHORT, LONG, ALL } = require("../../constants/flags");
const { validateBodyUsername,
  validateBodyPostPrivacy,
  validateBodyPostType,
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
  validateBodyProgression,
} = require('../../utils/validators');
const { checkStringBoolean } = require('../../utils/helper');

const verifyArray = (value) => {
  if (Array.isArray(value)) return value;
  else {
    return [value];
  }
}
const postImageFields = [
  { name: "images" },
  { name: "coverPhoto", maxCount: 1 }];

const updatePostLists = (post, pursuitCategory, pursuits, recentPosts) => {
  setRecentPosts(post.post_id, recentPosts);
  insertAndSortIntoList(pursuits[0].posts, post);
  for (let i = 1; i < pursuits.length; i++) {
    if (pursuitCategory === pursuits[i].name) {
      insertAndSortIntoList(pursuits[i].posts, post);
    }
  }
}

const setRecentPosts = (post, inputRecentPosts) => {
  inputRecentPosts.unshift(post);
  if (inputRecentPosts.length > RECENT_POSTS_LIMIT) {
    inputRecentPosts.pop();
  }
}

const updateDeletedPostMeta = (pursuits, pursuitCategory, minDuration, isMilestone, isIndexUser) => {
  if (!pursuitCategory) return;
  for (const pursuit of pursuits) {
    if (pursuit.name === pursuitCategory) {
      if (isMilestone) { pursuit.num_milestones -= 1; }
      if (minDuration) { pursuit.total_min -= pursuit.minDuration; }
      if (isIndexUser) { pursuit.num_posts -= 1; }
    }
  }
}

const createContentPreview = (postID, date, labels, branch) => (
  new ContentPreview.Model({
    post_id: postID,
    date: date,
    labels: labels,
    branch: branch,
  })
);

const insertAndSortIntoList = (postList, postPreview) => {
  postList.unshift(postPreview);
  if (postList.length > 1) {
    postList.sort((a, b) => {
      if (!b.date && !a.date) {
        b.createdAt - a.createdAt;
      }
      else if (!b.date) {
        postList.sort((a, b) => b.createdAt - a.date);
      }
      else if (!a.date) {
        postList.sort((a, b) => b.date - a.createdAt);
      }
      else {
        postList.sort((a, b) => b.date - a.date);
      }

    });
  }

  return postList;
}

const setPursuitAttributes = (isIndexUser, pursuits, pursuitCategory, progression, minDuration) => {
  for (const pursuit of pursuits) {
    if (pursuit.name === ALL) {
      if (isIndexUser) {
        pursuit.num_posts = Number(pursuit.num_posts) + 1;
      }
      if (progression === 2) {
        pursuit.num_milestones = Number(pursuit.num_milestones) + 1;
      }
      if (minDuration) {
        pursuit.total_min = Number(pursuit.total_min) + minDuration;
      }
    }
    else if (pursuit.name === pursuitCategory) {
      if (progression === 2) {
        pursuit.num_milestones = Number(pursuit.num_milestones) + 1;
      }
      if (minDuration) {
        pursuit.total_min = Number(pursuit.total_min) + minDuration;
      }
    }
  }
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
  pursuitCategory, displayPhoto, coverPhotoKey, postFormat, isPaginated, progression,
  imageData, textSnippet, textData, minDuration, difficulty, labels) => {
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
        progression: progression,
        image_data: imageData,
        text_snippet: textSnippet,
        text_data: textData,
        min_duration: minDuration,
        difficulty: difficulty,
        labels: labels,
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
        progression: progression,
        text_snippet: textSnippet,
        text_data: textData,
        min_duration: minDuration,
        difficulty: difficulty,
        labels: labels,
      });
    default:
      throw new Error("No post type matched.");
  }
}

const updateLabels = (completeUser, indexUser, labels) => {

  if (indexUser.labels.length === 0) {
    indexUser.labels = labels;
    completeUser.labels = labels;
  }
  else {
    let parsedCurrentLabels = indexUser.labels;
    parsedCurrentLabels.push(...labels);
    indexUser.labels = [...new Set(parsedCurrentLabels)];
    completeUser.labels = [...new Set(parsedCurrentLabels)];

  }
}

router.route('/').post(
  MulterHelper.contentImageUpload.fields(postImageFields),
  validateBodyUsername,
  validateBodyPostPrivacy,
  validateBodyPostType,
  validateBodyProgression,
  validateBodyIsPaginated,
  doesValidationErrorExist,
  retrieveRelevantUserInfo,
  (req, res, next) => {
    const postType = req.body.postType;
    const username = req.body.username;
    const postPrivacyType = req.body.postPrivacyType;
    const progression = req.body.progression;
    const isPaginated = checkStringBoolean(req.body.isPaginated);
    const displayPhoto = req.body.displayPhoto ? req.body.displayPhoto : null;
    const difficulty = req.body.difficulty ? req.body.difficulty : null;
    const title = req.body.title ? req.body.title : null;
    const subtitle = req.body.subtitle ? req.body.subtitle : null;
    const pursuitCategory = req.body.pursuit ? req.body.pursuit : null;
    const labels = req.body.labels ? verifyArray(req.body.labels) : [];
    const date = req.body.date ? new Date(req.body.date) : null;
    const textData = req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const coverPhotoKey = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const imageData = req.files && req.files.images ? getImageUrls(req.files.images) : [];
    const textSnippet = textData ? makeTextSnippet(postType, isPaginated, textData) : null;
    const indexUser = req.indexUser;
    const user = req.completeUser;
    console.log(labels, "as11df");
    const post = createPost(
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
      progression,
      imageData,
      textSnippet,
      textData,
      minDuration,
      difficulty,
      labels
    );

    res.locals.post_id = post._id;


    if (indexUser.preferred_post_privacy !== postPrivacyType) {
      indexUser.preferred_post_privacy = postPrivacyType;
    }

    updatePostLists(createContentPreview(post._id, post.date), post.pursuit_category, user.pursuits, indexUser.recent_posts);
    setPursuitAttributes(true, indexUser.pursuits, pursuitCategory, progression, minDuration);
    setPursuitAttributes(false, user.pursuits, pursuitCategory, progression, minDuration, post._id, date)
    updateLabels(user, indexUser, labels);
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
  },
  (req, res, next) => {
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
              indexUser.following_feed.unshift(res.locals.post_id);
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
    validateBodyProgression,
    validateBodyIsPaginated,
    validateBodyRemoveCoverPhoto,
    doesValidationErrorExist,
    (req, res, next) => {
      const postID = req.body.postID;
      const postType = req.body.postType;
      const username = req.body.username;
      const progression = req.body.progression;
      const isPaginated = checkStringBoolean(req.body.isPaginated);
      const difficulty = req.body.difficulty ? req.body.difficulty : null;
      const postPrivacyType = req.body.postPrivacyType ? req.body.postPrivacyType : null;
      const labels = req.body.labels ? verifyArray(req.body.labels) : [];
      const indexUserID = req.body.indexUserID ? req.body.indexUserID : null;
      const title = !!req.body.title ? req.body.title : null;
      const subtitle = !!req.body.subtitle ? req.body.subtitle : null;
      const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
      const date = !!req.body.date ? req.body.date : null;
      const textData = !!req.body.textData ? req.body.textData : null;
      const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
      const coverPhotoKey = req.file ? req.file.key : null;
      const removeCoverPhoto = checkStringBoolean(req.body.removeCoverPhoto);
      let shouldUpdateLabels = false;
      let completeUserID = null;
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
            shouldUpdateLabels = labels !== post.labels;
            completeUserID = post.author_id;
            post.labels = labels;
            post.difficulty = difficulty;
            post.username = username;
            post.title = title;
            post.subtitle = subtitle;
            post.pursuit_category = pursuitCategory;
            post.date = date;
            post.min_duration = minDuration;
            post.progression = progression;
            post.is_paginated = isPaginated;
            post.text_data = textData;
            post.text_snippet = textData ? makeTextSnippet(postType, isPaginated, textData) : null;
            return post.save()
          })
        .then(() => {
          if (shouldUpdateLabels) {
            console.log(completeUserID, indexUserID);
            return Promise.all([retrieveUserByID(completeUserID), retrieveIndexUserByID(indexUserID)])
              .then(
                results => {
                  const completeUser = results[0];
                  const indexUser = results[1];
                  updateLabels(completeUser, indexUser, labels);
                  return Promise.all([completeUser.save(), indexUser.save()]);
                }
              )
              .then(() => res.status(200).send());
          }
          else
            return res.status(200).send();
        })
        .catch(next)
    })
  .delete(
    validateBodyIndexUserID,
    validateBodyUserID,
    validateBodyPostID,
    validateBodyProgression,
    doesValidationErrorExist,
    (req, res, next) => {
      const indexUserID = req.body.indexUserID;
      const userID = req.body.userID;
      const postID = req.body.postID;
      const pursuitCategory = req.body.pursuit;
      const minDuration = req.body.minDuration;
      const progression = (req.body.progression === 2);
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
            updateDeletedPostMeta(indexUser.pursuits, pursuitCategory, minDuration, progression, true)

            return indexUser.save();
          })
          .catch(next);

      const resolvedUser = retrieveUserByID(userID)
        .then((user) => {
          let updatedAllPosts = [];
          for (const post of user.posts) {
            if (post.toString() !== postID) {
              updatedAllPosts.unshift(post);
            }
          }
          user.posts = updatedAllPosts;
          updateDeletedPostMeta(user.pursuits, pursuitCategory, minDuration, progression, false)

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
        return res.status(200).json({
          posts: posts,
          isMissingPosts: posts.length !== postIDList.length ? true : false
        });
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
