const express = require('express');
const router = express.Router();
const MulterHelper = require('../../../shared/utils/multer');
const {
  findManyByID,
  findManyAndUpdate,
  findByID,
  deleteByID
} = require('../../../data-access/dal');
const {
  PARAM_CONSTANTS,
  buildQueryValidationChain,
  buildBodyValidationChain,
  doesValidationErrorExist,
} = require('../../../shared/validators/validators');
const ModelConstants = require('../../../models/constants');
const {
  checkStringBoolean,
  verifyArray
} = require('../../../shared/helper');
const selectModel = require('../../../models/modelServices');
const postServices = require('./services');
const projectServices = require('../project/services');
const postImageFields = [
  { name: "images" },
  { name: "coverPhoto", maxCount: 1 }];

router.route('/').post(
  MulterHelper.contentImageUpload.fields(postImageFields),
  buildBodyValidationChain(
    PARAM_CONSTANTS.USERNAME,
    PARAM_CONSTANTS.POST_PRIVACY,
    PARAM_CONSTANTS.POST_TYPE,
    PARAM_CONSTANTS.PROGRESSION,
    PARAM_CONSTANTS.IS_PAGINATED,
    PARAM_CONSTANTS.SELECTED_DRAFT_ID,
  ),
  doesValidationErrorExist,
  postServices.retrieveRelevantUserInfo,
  (req, res, next) => {
    const threadTitle = req.body.threadTitle;
    const threadTitlePrivacy = req.body.threadTitlePrivacy;
    const selectedDraft = req.body.selectedDraftID;
    return findByID(ModelConstants.PROJECT, selectedDraft)
      .then((result) => {
        console.log('project', result);
        res.locals.project = result;
        return next();
      });

  },
  (req, res, next) => {
    const isCompleteProject = req.body.completeProject ? req.body.completeProject : false;
    if (isCompleteProject) {
      // const res.locals.project = result;
      // res.locals.project = result;
      return selectModel(ModelConstants.PROJECT_PREVIEW_WITH_ID)
        .findOne({ project_id: res.locals.project._id })
        .then((result) => {
          console.log('projectpreview', result);
          res.locals.projectPreview = result;
          return next();
        });
    }
    return next();
  },
  (req, res, next) => {
    const postType = req.body.postType;
    const username = req.body.username;
    const postPrivacyType = req.body.postPrivacyType;
    const progression = req.body.progression;
    const pursuitCategory = req.body.pursuit ? req.body.pursuit : res.locals.project.pursuit;
    const isPaginated = checkStringBoolean(req.body.isPaginated);
    const displayPhoto = req.body.displayPhoto ? req.body.displayPhoto : null;
    const difficulty = req.body.difficulty ? req.body.difficulty : null;
    const title = req.body.title ? req.body.title : null;
    const subtitle = req.body.subtitle ? req.body.subtitle : null;
    const labels = req.body.labels ? verifyArray(req.body.labels) : [];
    const date = req.body.date ? new Date(req.body.date) : null;
    const textData = req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const coverPhotoKey = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const imageData = req.files && req.files.images ? postServices.getImageUrls(req.files.images) : [];
    const textSnippet = textData ? postServices.makeTextSnippet(postType, isPaginated, textData) : null;
    const isCompleteProject = req.body.completeProject ? checkStringBoolean(req.body.completeProject) : false;
    const indexUser = res.locals.indexUser;
    const user = res.locals.completeUser;
    const userPreview = res.locals.userPreview;
    let projectPreview = res.locals.projectPreview;
    let project = res.locals.project;

    const post = postServices.createPost(
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
      labels,
      project.project_preview_id
    );
    const postPreview = postServices.createContentPreview(post._id, post.date);
    res.locals.post_id = post._id;
    if (project) project.post_ids.unshift(post._id);
    if (indexUser.preferred_post_privacy !== postPrivacyType) {
      indexUser.preferred_post_privacy = postPrivacyType;
    }
    if (isCompleteProject) {
      console.log("yes");
      projectServices.removeProjectDraft(indexUser.drafts, project._id);
      projectPreview.status = "COMPLETE";
      project.status = "COMPLETE";
    }
    postServices.setRecentPosts(postPreview.content_id, indexUser.recent_posts);
    postServices.updatePostLists(
      postPreview,
      post.pursuit_category,
      user.pursuits,
    );

    postServices.updatePostLists(
      postPreview,
      post.pursuit_category,
      userPreview.pursuits,
    );

    postServices.setPursuitAttributes(
      true,
      indexUser.pursuits,
      pursuitCategory,
      progression,
      minDuration);

    postServices.setPursuitAttributes(
      false,
      user.pursuits,
      pursuitCategory,
      progression,
      minDuration,
      post._id,
      date);

    postServices.setPursuitAttributes(
      false,
      userPreview.pursuits,
      pursuitCategory,
      progression,
      minDuration,
      post._id,
      date);

    postServices.updateLabels(
      user,
      indexUser,
      labels);

    const savedUserPreview = userPreview.save()
      .catch(error => {
        if (error) {
          console.log(error);
          res.status(500).json('Error: ' + error);
        }
      });
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

    if (project) {
      const savedProject = project.save().catch(error => {
        if (error) {
          console.log(error);
          res.status(500).json('Error: ' + error);
        }
      });
      const promises = [savedUserPreview, savedIndexUser, savedUser, savedPost, savedProject];
      if (isCompleteProject) promises.push(projectPreview.save());
      console.log(promises);
      return Promise.all(promises)
        .then(() => next());
    }
    else {
      return Promise.all([savedUserPreview, savedIndexUser, savedUser, savedPost])
        .then(() => next());
    }
  },
  (req, res, next) => {
    let followersIDArray = [];
    for (const user of res.locals.userRelation.followers) {
      followersIDArray.push(user.user_preview_id);
    }
    return findManyByID(ModelConstants.USER_PREVIEW, followersIDArray)
      .then((result) => {
        if (result) {
          let indexUserIDArray = []
          for (const previewedUser of result) {
            indexUserIDArray.push(previewedUser.parent_index_user_id);
          }
          return findManyByID(ModelConstants.INDEX_USER, indexUserIDArray);
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
              }
              indexUser.save().then(() => resolve("saved")).catch(next);
            })
          );
          return Promise.all(promisedUpdatedFollowerArray)
            .then((result) => {
              return res.status(201).send(res.locals.post_id)
            });
        }
      )
      .catch(next);
  })
  .put(
    MulterHelper.contentImageUpload.single("coverPhoto"),
    buildBodyValidationChain(
      PARAM_CONSTANTS.POST_ID,
      PARAM_CONSTANTS.USERNAME,
      PARAM_CONSTANTS.POST_TYPE,
      PARAM_CONSTANTS.PROGRESSION,
      PARAM_CONSTANTS.IS_PAGINATED,
      PARAM_CONSTANTS.REMOVE_COVER_PHOTO
    ),
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
      return findByID(ModelConstants.POST, postID)
        .then(
          (result) => {
            let post = result;
            if (postPrivacyType) {
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
            post.text_snippet = textData ? postServices.makeTextSnippet(postType, isPaginated, textData) : null;
            return post.save()
          })
        .then(() => {
          if (shouldUpdateLabels) {
            return Promise.all([
              findByID(ModelConstants.USER, completeUserID),
              findByID(ModelConstants.INDEX_USER, indexUserID)])
              .then(
                results => {
                  const completeUser = results[0];
                  const indexUser = results[1];
                  postServices.updateLabels(completeUser, indexUser, labels);
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
    buildBodyValidationChain(
      PARAM_CONSTANTS.USER_PREVIEW_ID,
      PARAM_CONSTANTS.INDEX_USER_ID,
      PARAM_CONSTANTS.USER_ID,
      PARAM_CONSTANTS.POST_ID,
      PARAM_CONSTANTS.PROGRESSION,
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const indexUserID = req.body.indexUserID;
      const userID = req.body.userID;
      const postID = req.body.postID;
      const userPreviewID = req.body.userPreviewID;
      const pursuitCategory = req.body.pursuit;
      const minDuration = req.body.minDuration;
      const progression = (req.body.progression === 2);
      const resolvedIndexUser =
        findByID(ModelConstants.INDEX_USER, indexUserID)
          .then((indexUser) => {
            postServices.spliceArray(postID, indexUser.recent_posts);
            postServices.updateDeletedPostMeta(indexUser.pursuits, pursuitCategory, minDuration, progression, true)

            return indexUser.save();
          })
          .catch(next);

      const resolvedUser = findByID(ModelConstants.USER, userID)
        .then((user) => {
          const index = user.pursuits.findIndex((pursuit) => pursuit.name === pursuitCategory);
          if (index !== -1) {
            postServices.spliceArray(postID, user.pursuits[index].posts);
            postServices.updateDeletedPostMeta(user.pursuits[index], minDuration, progression, false);

          }
          postServices.spliceArray(postID, user.pursuits[0].posts);
          postServices.updateDeletedPostMeta(user.pursuits[0], minDuration, progression, false)
          return user.save();
        })
        .catch((error) => {
          throw new Error(error, "Something went wrong resolving user")
        });

      const resolvedUserPrevew = findByID(ModelConstants.USER_PREVIEW, userPreviewID)
        .then(userPreview => {
          const index = userPreview.pursuits.findIndex((pursuit) => pursuit.name === pursuitCategory);
          if (index !== -1) {
            postServices.spliceArray(postID, userPreview.pursuits[index].posts);
            postServices.updateDeletedPostMeta(userPreview.pursuits[index], minDuration, progression, false);
          }
          postServices.spliceArray(postID, userPreview.pursuits[0].posts);
          postServices.updateDeletedPostMeta(userPreview.pursuits[0], minDuration, progression, false)
          return userPreview.save();
        })

      return Promise.all([
        resolvedIndexUser,
        resolvedUser,
        resolvedUserPrevew,
        findByID(ModelConstants.POST, postID)])
        .then((results) => {
          if (results[3].comments.length === 0) return deleteByID(ModelConstants.POST, postID);
          return Promise.all([
            deleteByID(ModelConstants.POST, postID),
            deleteManyByID(ModelConstants.COMMENT, results[3].comments)
          ])
        })
        .then(() => res.status(204).send())
        .catch(next);
    });

router.route('/multiple').get(
  buildQueryValidationChain(
    PARAM_CONSTANTS.POST_ID_LIST,
    PARAM_CONSTANTS.INCLUDE_POST_TEXT
  ),
  doesValidationErrorExist,
  (req, res, next) => {
    const postIDList = req.query.postIDList;
    const includePostText = req.query.includePostText;
    return Promise.all([
      postServices.findPosts(postIDList, includePostText),
      postServices.countComments(postIDList)])
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
  buildQueryValidationChain(
    PARAM_CONSTANTS.TEXT_ONLY,
    PARAM_CONSTANTS.POST_ID,
  ),
  doesValidationErrorExist,
  (req, res, next) => {
    const textOnly = req.query.textOnly.toUpperCase();
    const postID = req.query.postID;
    return findByID(ModelConstants.POST, postID)
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
    buildBodyValidationChain(
      PARAM_CONSTANTS.USERNAME,
      PARAM_CONSTANTS.IMAGE_KEY
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const imageKey = req.body.imageKey;
      return findManyAndUpdate(
        ModelConstants.POST,
        { username: username },
        { display_photo_key: imageKey })
        .then(() => {
          return res.status(200).send();
        })
        .catch(next)
    })
module.exports = router;
