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

const postServices = require('./services');
const { updateMetaInfo, loadProjectPreview, loadParentThread, sendToFollowers, loadPostCreation, sendToRecievers, findRecievers } = require('./create');
const { updatePost } = require('./update');
const { POST, USER } = require('../../../models/constants');
const postImageFields = [
  { name: "images" },
  { name: "coverPhoto", maxCount: 1 }];

router.route('/').post(
  MulterHelper.contentImageUpload.fields(postImageFields),
  buildBodyValidationChain(
    PARAM_CONSTANTS.USERNAME,
    PARAM_CONSTANTS.TITLE,
    PARAM_CONSTANTS.POST_PRIVACY,
    PARAM_CONSTANTS.IS_PAGINATED,
    PARAM_CONSTANTS.SELECTED_DRAFT_ID,
  ),
  doesValidationErrorExist,
  postServices.retrieveRelevantUserInfo,
  loadParentThread,
  loadProjectPreview,
  loadPostCreation,
  updateMetaInfo,
  findRecievers,
  sendToRecievers)

  .put(
    MulterHelper.contentImageUpload.single("coverPhoto"),
    buildBodyValidationChain(
      PARAM_CONSTANTS.POST_ID,
      PARAM_CONSTANTS.USERNAME,
      PARAM_CONSTANTS.IS_PAGINATED,
      // PARAM_CONSTANTS.REMOVE_COVER_PHOTO
    ),
    doesValidationErrorExist,
    updatePost)
  .delete(
    buildBodyValidationChain(
      PARAM_CONSTANTS.USER_PREVIEW_ID,
      PARAM_CONSTANTS.INDEX_USER_ID,
      PARAM_CONSTANTS.USER_ID,
      PARAM_CONSTANTS.POST_ID,
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const indexUserID = req.body.indexUserID;
      const userID = req.body.userID;
      const postID = req.body.postID;
      const userPreviewID = req.body.userPreviewID;
      const pursuitCategory = req.body.pursuit;
      const minDuration = req.body.minDuration;
      const resolvedIndexUser =
        findByID(ModelConstants.INDEX_USER, indexUserID)
          .then((indexUser) => {
            postServices.spliceArray(postID, indexUser.recent_posts);
            postServices.updateDeletedPostMeta(indexUser.pursuits, pursuitCategory, minDuration, true)

            return indexUser.save();
          })
          .catch(next);

      const resolvedUser = findByID(ModelConstants.USER, userID)
        .then((user) => {
          const index = user.pursuits.findIndex((pursuit) => pursuit.name === pursuitCategory);
          if (index !== -1) {
            postServices.spliceArray(postID, user.pursuits[index].posts);
            postServices.updateDeletedPostMeta(user.pursuits[index], minDuration, false);

          }
          postServices.spliceArray(postID, user.pursuits[0].posts);
          postServices.updateDeletedPostMeta(user.pursuits[0], minDuration, false)
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
            postServices.updateDeletedPostMeta(userPreview.pursuits[index], minDuration, false);
          }
          postServices.spliceArray(postID, userPreview.pursuits[0].posts);
          postServices.updateDeletedPostMeta(userPreview.pursuits[0], minDuration, false)
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
            post.comment_count = commentData[post._id.toString()]
              ? commentData[post._id.toString()] : 0;
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

router.route('/cached-feed')
  .get(
    buildQueryValidationChain(
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const cachedFeedsID = req.query.cachedFeedsID;
      console.log("thing", req.query);
      return findByID(ModelConstants.FEED, cachedFeedsID)
        .then(result => {
          return res.status(200).json(result);
        })
        .catch((err) => { console.log(err) });
    }
  );

router.route('/extra-feed')
  .get(
    buildQueryValidationChain(

    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const contentList = req.query.contentList.map(raw => JSON.parse(raw));
      const postIDList = postServices.getPostIDsForExtraFeed(contentList);
       return postServices.findPosts(postIDList, true)
        .then((results) => {
           const dictionary = {};
          results.forEach(
            (item) => {
              dictionary[item._id] = item;
            }
          );

          for (let object of contentList) {
            if (object.type === POST) {
               object.data = dictionary[object.content];
            }
            else if (object.type === USER) {
              const userPursuit = object.content.pursuit;
              if (userPursuit.posts.length > 0) {
                object.data = dictionary[object.content.pursuit.posts[0].content_id];
              }
            }
          }
           return res.status(200).json({ contentList });
        })
        .catch(next);
    }
  )



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
