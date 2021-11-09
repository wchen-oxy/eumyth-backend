const express = require('express');
const router = express.Router();
const MulterHelper = require('../../../shared/utils/multer');
const imageService = require('./services.js');
const {
  PARAM_CONSTANTS,
  doesValidationErrorExist,
  buildQueryValidationChain,
  buildBodyValidationChain,
}
  = require('../../../shared/validators/validators');
const {
  findOne,
  findByID
} = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const imageUpload = MulterHelper.contentImageUpload.single('file');

const displayPhotoUploadFields = [
  { name: "croppedImage" },
  { name: "smallCroppedImage" },
  { name: "tinyCroppedImage" }
];

const imageError = { error: "No image key provided." };
const returnImageData = (data) => {
  return {
    "image":
      "data:" + data.ContentType
      + ";base64," + data.Body.toString('base64')
  }
}
const returnUplodadedImageInfo = (data) => {
  return {
    'url': data.location,
    'file': data.key
  }
}

router.route('/')
  .get(
    buildQueryValidationChain(PARAM_CONSTANTS.IMAGE_KEY),
    doesValidationErrorExist,
    (req, res, next) => {
      imageService.getSingle(req.query.imageKey)
        .then((data) => res.status(200).json(returnImageData(data)))
        .catch(next)
    })
  .post(imageUpload, (req, res) => {
    return res.status(200).json(returnUplodadedImageInfo(req.file));
  })
  .delete(
    buildBodyValidationChain(PARAM_CONSTANTS.IMAGE_KEY),
    doesValidationErrorExist,
    (req, res, next) => {
      const imageKey = req.body.imageKey;
      if (!imageKey) return res.status(500).json(imageError);
      else {
        return imageService.deleteSingle(imageKey)
          .then(() => res.status(204).send())
          .catch(next);
      }
    });


router.route('/navbar-display-photo')
  .get(
    buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => findOne(ModelConstants.INDEX_USER, { username: req.query.username })
      .then((result) => {
        if (result) return res.status(200).send(result.tiny_cropped_display_photo_key);
        else {
          res.status(204).send();
        }
      })
      .catch(next)
  )

router.route('/display-photo')
  .post(
    MulterHelper.profileImageUpload.fields(displayPhotoUploadFields),
    buildBodyValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const croppedImage = req.files.croppedImage ? req.files.croppedImage[0].key : null;
      const smallCroppedImage = req.files.smallCroppedImage ? req.files.smallCroppedImage[0].key : null;
      const tinyCroppedImage = req.files.tinyCroppedImage ? req.files.tinyCroppedImage[0].key : null;
      let returnedIndexUser = null;

      if (!croppedImage || !smallCroppedImage || !tinyCroppedImage) {
        console.log("No image here");
        return res.status(500).json({ error: "Something went wrong during image upload." });
      }

      return findOne(ModelConstants.INDEX_USER, { username: username })
        .then((result) => {
          returnedIndexUser = result;
          imageService.setAllCroppedImages(
            returnedIndexUser,
            croppedImage,
            smallCroppedImage,
            tinyCroppedImage);
          returnedIndexUser.cropped_display_photo_key = croppedImage;
          returnedIndexUser.small_cropped_display_photo_key = smallCroppedImage;
          returnedIndexUser.tiny_cropped_display_photo_key = tinyCroppedImage;

          return Promise.all([
            findByID(ModelConstants.USER, result.user_profile_id),
            findByID(ModelConstants.USER_PREVIEW, returnedIndexUser.user_preview_id)
          ]);
        })
        .then((result) => {
          result[0].cropped_display_photo_key = croppedImage;
          result[0].small_cropped_display_photo_key = smallCroppedImage;
          result[0].tiny_cropped_display_photo_key = tinyCroppedImage;
          result[1].small_cropped_display_photo_key = smallCroppedImage;
          result[1].tiny_cropped_display_photo_key = tinyCroppedImage;

          return Promise.all([
            returnedIndexUser.save(),
            result[0].save(),
            result[1].save()]);
        })
        .then(() => res.status(201).json({ imageKey: smallCroppedImage }))
        .catch(next);
    })
  .delete(
    buildBodyValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      let returnedIndexUser = null;
      return findOne(ModelConsants.INDEX_USER, { username: username })
        .then((result) => {
          returnedIndexUser = result;
          if (returnedIndexUser.cropped_display_photo_key === '') {
            throw new Error("No Cropped Display Photo");
          }
          const displayPhotoKeys =
            [
              returnedIndexUser.cropped_display_photo_key,
              returnedIndexUser.small_cropped_display_photo_key,
              returnedIndexUser.tiny_cropped_display_photo_key
            ]
          return Promise.all([
            findByID(ModelConsants.INDEX_USER, returnedIndexUser.user_profile_id),
            imageService.deleteMultiple(displayPhotoKeys),
            findByID(ModelConsants.USER_PREVIEW, returnedIndexUser.user_preview_id)])
        })
        .then((results) => {
          results[0].cropped_display_photo_key = "";
          results[0].small_cropped_display_photo_key = "";
          results[0].tiny_cropped_display_photo_key = "";
          returnedIndexUser.cropped_display_photo_key = "";
          returnedIndexUser.small_cropped_display_photo_key = "";
          returnedIndexUser.tiny_cropped_display_photo_key = "";
          results[2].small_cropped_display_photo_key = "";
          results[2].tiny_cropped_display_photo_key = "";

          return Promise.all([
            results[0].save(),
            returnedIndexUser.save(),
            results[2].save()]);
        })
        .then(() => (
          res.status(201).json({ userId: returnedIndexUser.user_profile_id }))
        )
        .catch(next);
    });

router.route('/cover')
  .post(
    MulterHelper.profileImageUpload.single("coverPhoto"),
    buildBodyValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const coverPhoto = req.file.key;
      let returnedUser = null;

      if (!coverPhoto) {
        return new Error("Something went wrong when uploading cover image.");
      }

      return findOne(ModelConsants.USER, { username: username })
        .then((user) => {
          returnedUser = user;
          user.cover_photo_key = coverPhoto;
          return returnedUser.save();
        })
        .then(() => res.status(200).send())
        .catch(next)
    })
  .delete(
    buildBodyValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      let returnedUser = null;
      return findOne(ModelConsants.USER, { username: username })
        .then((user) => {
          returnedUser = user;
          if (!returnedUser.cover_photo_key || returnedUser.cover_photo_key === "")
            return res.status(204).json("No Content");
          return imageService.deleteSingle(user.cover_photo_key)
            .then(() => {
              returnedUser.cover_photo_key = "";
              return returnedUser.save();
            })
            .then(() => (res.status(204).send()));
        })
        .catch(next);
    });

router.route('/multiple')
  .delete(
    buildBodyValidationChain(PARAM_CONSTANTS.KEYS),
    doesValidationErrorExist,
    (req, res, next) => {
      const photoKeys = req.body.keys;
      return imageService.deleteMultiple(photoKeys)
        .then((result) => res.status(204).send())
        .catch(next);
    })

const compressor = (req, res, next) => {
  console.log(req);
  let image = req.body.file;
  let images = req.body;
  next();
}

router.route('/compress')
  .post(compressor, (req, res) => {
    return res.status(200).send();
  })
module.exports = router;
