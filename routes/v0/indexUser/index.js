const router = require('express').Router();
const { findOne } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const {
  PARAM_CONSTANTS,
  buildQueryValidationChain,
  doesValidationErrorExist,
} = require("../../../shared/validators/validators");

router.get('/',
  buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    const isTruncated = req.query.isTruncated;
    return findOne(ModelConstants.INDEX_USER, { username: username })
      .then(result => {
        if (!result) return res.status(204).send()
        if (isTruncated) {
          const truncatedUser = {
            drafts: result.drafts,
            cached_feed_id: result.cached_feed_id,
            labels: result.labels,
            username: result.username,
            preferredPostType: result.preferred_post_privacy,
            croppedDisplayPhotoKey: result.cropped_display_photo_key,
            smallCroppedDisplayPhotoKey: result.small_cropped_display_photo_key,
            tinyCroppedDisplayPhotoKey: result.tiny_cropped_display_photo_key,
            userPreviewID: result.user_preview_id,
            indexProfileID: result._id,
            profileID: result.user_profile_id,
            userRelationID: result.user_relation_id,
            pursuits: result.pursuits,
            followingFeed: result.following_feed,
            recentPosts: result.recent_posts
          }
          return res.status(200).json(truncatedUser);
        }
        return res.status(200).json(result);
      })
      .catch(next)
  })

router.get('/pursuits',
  buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    return findOne(ModelConstants.INDEX_USER, { username: username })
      .then(result => res.status(200).json(result.pursuits))
      .catch(next)
  })

router.get('/username',
  buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    return findOne(ModelConstants.INDEX_USER, { username: username })
      .then(() => res.status(200).send())
      .catch(next)
  })

module.exports = router;
