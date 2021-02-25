var express = require('express');
var router = express.Router();
const AWSConstants = require('../../constants/aws');
const MulterHelper = require('../../constants/multer');
const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');
const UserPreview = require('../../models/user.preview.model');

const displayPhotoUploadFields = [
  { name: "croppedImage" },
  { name: "smallCroppedImage" },
  { name: "tinyCroppedImage" }
];

router.route('/')
  .post(MulterHelper.contentImageUpload.single('file'), (req, res) => {
    return res.status(200).json({
      'url': req.file.location,
      'file': req.file.key
    });
  });


router.route('/single')
  .post(MulterHelper.contentImageUpload.single('file'), (req, res) => {
    return res.status(200).json({ 'imageUrl': req.file.key });
  });


router.route('/multiple')
  .post(MulterHelper.contentImageUpload.array('files'), (req, res) => {
    let imageArray = [];
    for (const imageFile of req.files) {
      imageArray.push(imageFile.key);
    }
    return res.status(200).json({ 'imageUrls': imageArray });
  });

router.route('/navbar-display-photo')
  .get((req, res) => IndexUser.Model.findOne({ username: req.query.username })
    .then((result) => {
      if (result) return res.status(200).send(result.tiny_cropped_display_photo_key);
      else {
        res.status(204).send();
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: error });
    })
  )

router.route('/display-photo')
  .post(MulterHelper.contentImageUpload.fields(displayPhotoUploadFields),
    (req, res) => {
      const username = req.body.username;
      const croppedImage = req.files.croppedImage ? req.files.croppedImage[0].key : null;
      const smallCroppedImage = req.files.smallCroppedImage ? req.files.smallCroppedImage[0].key : null;
      const tinyCroppedImage = req.files.tinyCroppedImage ? req.files.tinyCroppedImage[0].key : null;
      let returnedIndexUser = null;

      if (!croppedImage || !smallCroppedImage || !tinyCroppedImage) {
        console.log("No image here");
        return res.status(500).json({ error: "Something went wrong during image upload." });
      }
      console.log(username);
      return IndexUser.Model.findOne({ username: username })
        .then((result) => {
          console.log(result);
          if (!result) throw new Error(204);

          returnedIndexUser = result;
          returnedIndexUser.cropped_display_photo_key = croppedImage;
          returnedIndexUser.small_cropped_display_photo_key = smallCroppedImage;
          returnedIndexUser.tiny_cropped_display_photo_key = tinyCroppedImage;

          return Promise.all([
            User.Model.findById(result.user_profile_id),
            UserPreview.Model.findById(returnedIndexUser.user_preview_id)
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
        .catch((error) => {
          console.log(error);
          if (error.status === 204) return res.status(204).json({ error: error })
          return res.status(500).json({ error: error });
        });
    })
  .delete((req, res) => {
    const username = req.body.username;
    let returnedIndexUser = null;
    return IndexUser.Model.findOne({ username: username })
      .then((result) => {
        returnedIndexUser = result;
        // console.log(returnedIndexUser);
        if (returnedIndexUser.cropped_display_photo_key === '') {
          throw new Error(204);
        }

        const displayPhotoKeys = [
          { Key: returnedIndexUser.cropped_display_photo_key },
          { Key: returnedIndexUser.small_cropped_display_photo_key },
          { Key: returnedIndexUser.tiny_cropped_display_photo_key }
        ];

        return Promise.all([
          User.Model.findById(returnedIndexUser.user_profile_id),
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
          UserPreview.Model.findById(returnedIndexUser.user_preview_id)])
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
      .catch((error) => {
        console.log(error.message);
        console.log("thing");
        if (error.message === "204") {
          console.log("werewr");
          return res.status(204).json({ result: "No Content" });
        }
        else {
          return res.status(500).json({ error: error });
        }
      });
  });

router.route('/cover')
  .post(MulterHelper.profileImageUpload.single("coverPhoto"), (req, res) => {
    const username = req.body.username;
    const coverPhoto = req.file.key;
    let returnedUser = null;

    if (!coverPhoto) {
      return res.status(500).json({
        error: "Something went wrong when uploading cover image."
      });
    }

    return User.Model.findOne({ username: username })
      .then((user) => {
        if (!user) throw new Error(204);

        returnedUser = user;
        user.cover_photo_key = coverPhoto;

        return returnedUser.save();
      })
      .then(() => res.status(200).send())
      .catch(error => {
        console.log(error);
        if (error.status === 204) return res.status(204).json({ error: "No user found." })
        return res.status(500).send();
      })
  })
  .delete((req, res) => {
    const username = req.body.username;
    let returnedUser = null;

    return User.Model.findOne({ username: username })
      .then((user) => {
        returnedUser = user;

        if (returnedUser.cover_photo_key === "") throw 204;

        return AWSConstants
          .S3_INTERFACE
          .deleteObject({
            Bucket: AWSConstants.BUCKET_NAME,
            Key: user.cover_photo_key,
          }, function (error, data) {
            if (error) {
              console.log(error, error.stack);
              throw new Error("Something went wrong while deleting the file from Amazon.", error)
            };
          });
      })
      .then(() => {
        returnedUser.cover_photo_key = "";
        return returnedUser.save();
      })
      .then(() => (res.status(204).send()))
      .catch((error) => {
        console.log(error);

        if (error === 204) {
          return res.status(204).json("No Content");
        }

        return res.status(500).send()
      });
  });

module.exports = router;
