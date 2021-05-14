const express = require('express');
const router = express.Router();
const AWSConstants = require('../../constants/aws');
const MulterHelper = require('../../constants/multer');
const {
  validateQueryImageKey,
  validateBodyImageKey,
  validateBodyKeys,
  validateQueryUsername,
  validateBodyUsername,
  doesValidationErrorExist,
}
  = require('../../utils/validators');
const { retrieveIndexUserByUsername, retrieveUserByID, retrieveUserPreviewByID, retrieveUserByUsername } = require('../../data_access/dal');

const imageUpload = MulterHelper.contentImageUpload.single('file');

const displayPhotoUploadFields = [
  { name: "croppedImage" },
  { name: "smallCroppedImage" },
  { name: "tinyCroppedImage" }
];

router.route('/')
  .get(
    validateQueryImageKey,
    doesValidationErrorExist,
    (req, res, next) => {
      return AWSConstants
        .S3_INTERFACE
        .getObject({
          Bucket: AWSConstants.BUCKET_NAME,
          Key: req.query.imageKey,
        }
        ).promise()
        .then((data) => {
          return res.status(200).json({
            "image": "data:" + data.ContentType + ";base64," + data.Body.toString('base64')
          });
        })
        .catch(next)
    })
  .post(imageUpload, (req, res) => {
    return res.status(200).json({
      'url': req.file.location,
      'file': req.file.key
    });
  })
  .delete(
    validateBodyImageKey,
    doesValidationErrorExist,
    (req, res, next) => {
      const imageKey = req.body.imageKey;
      if (!imageKey) return res.status(500).json({ error: "No image key provided." });
      else {
        return AWSConstants
          .S3_INTERFACE
          .deleteObject({
            Bucket: AWSConstants.BUCKET_NAME,
            Key: imageKey
          }, function (error, data) {
            if (error) {
              console.log("Something bad happened");
              console.log(error, error.stack);
              throw new Error(error);
            }
            else { console.log("Success", data); }
          })
          .promise()
          .then(() => {
            return res.status(204).send()
          })
          .catch(next);
      }
    });


router.route('/navbar-display-photo')
  .get(
    validateQueryUsername,
    doesValidationErrorExist,
    (req, res, next) => retrieveIndexUserByUsername(req.query.username)
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
    validateBodyUsername,
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
      return retrieveIndexUserByUsername(username)
        .then((result) => {
          returnedIndexUser = result;
          returnedIndexUser.cropped_display_photo_key = croppedImage;
          returnedIndexUser.small_cropped_display_photo_key = smallCroppedImage;
          returnedIndexUser.tiny_cropped_display_photo_key = tinyCroppedImage;

          return Promise.all([
            retrieveUserByID(result.user_profile_id),
            retrieveUserPreviewByID(returnedIndexUser.user_preview_id)
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
    validateBodyUsername,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      let returnedIndexUser = null;
      return retrieveIndexUserByUsername(username)
        .then((result) => {
          returnedIndexUser = result;
          if (returnedIndexUser.cropped_display_photo_key === '') {
            throw new Error("No Cropped Display Photo");
          }
          const displayPhotoKeys = [
            { Key: returnedIndexUser.cropped_display_photo_key },
            { Key: returnedIndexUser.small_cropped_display_photo_key },
            { Key: returnedIndexUser.tiny_cropped_display_photo_key }
          ];

          return Promise.all([
            retrieveUserByID(returnedIndexUser.user_profile_id),
            AWSConstants
              .S3_INTERFACE
              .deleteObjects({
                Bucket: AWSConstants.BUCKET_NAME,
                Delete: { Objects: displayPhotoKeys }
              }, function (error, data) {
                if (error) {
                  console.log("Something bad happened");
                  console.log(error, error.stack);
                  throw new Error(error);
                }
                else { console.log("Success", data); }
              })
              .promise(),
            retrieveUserPreviewByID(returnedIndexUser.user_preview_id)])
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
    validateBodyUsername,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const coverPhoto = req.file.key;
      let returnedUser = null;

      if (!coverPhoto) {
        return new Error("Something went wrong when uploading cover image.");
      }

      return retrieveUserByUsername(username)
        .then((user) => {
          returnedUser = user;
          user.cover_photo_key = coverPhoto;
          return returnedUser.save();
        })
        .then(() => res.status(200).send())
        .catch(next)
    })
  .delete(
    validateBodyUsername,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      let returnedUser = null;
      return retrieveUserByUsername(username)
        .then((user) => {
          returnedUser = user;
          if (!returnedUser.cover_photo_key || returnedUser.cover_photo_key === "")
            return res.status(204).json("No Content");
          return AWSConstants
            .S3_INTERFACE
            .deleteObject({
              Bucket: AWSConstants.BUCKET_NAME,
              Key: user.cover_photo_key,
            }, function (error, data) {
              console.log(error);
              console.log(data);
              if (error) {
                console.log(error, error.stack);
                throw new Error("Something went wrong while deleting the file from Amazon.", error)
              };
            })
            .promise()
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
    validateBodyKeys,
    doesValidationErrorExist,
    (req, res, next) => {
      const photoKeys = req.body.keys;
      let transformedKeys = [];
      for (const key of photoKeys) {
        transformedKeys.push({ Key: key })
      }
      return AWSConstants
        .S3_INTERFACE
        .deleteObjects({
          Bucket: AWSConstants.BUCKET_NAME,
          Delete: { Objects: transformedKeys }
        }, function (error, data) {
          if (error) {
            console.log("Something bad happened");
            console.log(error, error.stack);
            throw new Error(error);
          }
          else { console.log("Success", data); }
        })
        .promise()
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
