const router = require('express').Router();
const { retrieveIndexUserByUsername } = require('../../data_access/dal');
const {
  PARAM_CONSTANTS,
  buildQueryValidationChain,
  doesValidationErrorExist,
} = require("../../utils/validators/validators");

router.get('/',
  buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    const isTruncated = req.query.isTruncated;
    return retrieveIndexUserByUsername(username)
      .then(result => {
        if (isTruncated) {
          const truncatedUser = {
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
            pursuits: result.pursuits
          }
          return res.status(200).json(truncatedUser);
        }
        console.log("ADSFADF");
        return res.status(200).json(result);
      })
      .catch(next)
  })

router.get('/pursuits',
  buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    return retrieveIndexUserByUsername(username)
      .then(result => res.status(200).json(result.pursuits))
      .catch(next)
  })

router.get('/username',
  buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    return retrieveIndexUserByUsername(username)
      .then(() => res.status(200).send())
      .catch(next)
  })

module.exports = router;
