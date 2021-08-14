const router = require('express').Router();
const { retrieveIndexUserByUsername } = require('../../data_access/dal');
const {
  validateQueryUsername,
  doesValidationErrorExist
} = require("../../utils/validators");

router.get('/',
  validateQueryUsername,
  doesValidationErrorExist,
  (req, res, next) => {
    console.log(req.query);
    const username = req.query.username;
    const isTruncated = req.query.isTruncated;
    return retrieveIndexUserByUsername(username)
      .then(result => {
        if (isTruncated) {
          console.log("asdfad");
          const truncatedUser = {
            labels: result.labels,
            username: result.username,
            preferredPostType: result.preferred_post_privacy,
            croppedDisplayPhotoKey: result.cropped_display_photo_key,
            smallCroppedDisplayPhotoKey: result.small_cropped_display_photo_key,
            tinyCroppedDisplayPhotoKey: result.tiny_cropped_display_photo_key,
            userPreviewID: result.user_preview_id,
            profileID: result.user_profile_id,
            userRelationID: result.user_relation_id
          }
          return res.status(200).json(truncatedUser);
        }
        console.log("ADSFADF");
        return res.status(200).json(result);
      })
      .catch(next)
  })

router.get('/pursuits',
  validateQueryUsername,
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    return retrieveIndexUserByUsername(username)
      .then(result => res.status(200).json(result.pursuits))
      .catch(next)
  })

router.get('/username',
  validateQueryUsername,
  doesValidationErrorExist,
  (req, res, next) => {
    const username = req.query.username;
    return retrieveIndexUserByUsername(username)
      .then(() => res.status(200).send())
      .catch(next)
  })

module.exports = router;
