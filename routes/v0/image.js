var express = require('express');
var router = express.Router();
const multer = require('multer');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3')
const uuid = require('uuid');
const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');

var upload = multer({
  storage: multerS3({
    s3: AwsConstants.S3_INTERFACE,
    bucket: AwsConstants.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "images/content/" + uuid.v1())
    }
  })
});

var profileUpload = multer({
  storage: multerS3({
    s3: AwsConstants.S3_INTERFACE,
    bucket: AwsConstants.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "images/profile/" + uuid.v1())
    }
  })
}, function (err, data) {
  if (err) {
    console.log(err, err.stack);
    throw new Error("Something went wrong while uploading the file to  Amazon.", err)
  };
});

router.route('/').post(upload.single('file'), (req, res, err) => {
  return res.status(200).json({ 'url': req.file.location, 'file': req.file.key });
})

router.route('/single').post(upload.single('file'), (req, res, err) => {
  return res.status(200).json({ 'imageUrl': req.file.key });
});


router.route('/multiple').post(upload.array('files'), (req, res, err) => {
  let imageArray = [];
  for (const imageFile of req.files) {
    imageArray.push(imageFile.key);
  }
  return res.status(200).json({ 'imageUrls': imageArray });
});

router.route('/navbar-display-photo')
  .get(
    (req, res) =>{
      
      console.log(req.query);
      return (
      IndexUser.Model.findOne({ username: req.query.username })
        .then((result) => {
          if (result) return res.status(200).send(result.tiny_cropped_display_photo_key);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send();
        })
    )}

  )

router.route('/display-photo')
  .post(upload.fields([{ name: "croppedImage" }, { name: "smallCroppedImage" }, { name: "tinyCroppedImage" }]),
    (req, res) => {
      const username = req.body.username;
      const croppedImage = req.files.croppedImage ? req.files.croppedImage[0].key : null;
      const smallCroppedImage = req.files.smallCroppedImage ? req.files.smallCroppedImage[0].key : null;
      const tinyCroppedImage = req.files.tinyCroppedImage ? req.files.tinyCroppedImage[0].key : null;
      let returnedIndexUser = null;
      if (!croppedImage || !smallCroppedImage || !tinyCroppedImage) {
        console.log("No image here");
        return res.status(500).send("Something went wrong during image upload.");
      }
      return IndexUser.Model.findOne({ username: username })
        .then((result) => {
          returnedIndexUser = result;
          returnedIndexUser.cropped_display_photo_key = croppedImage;
          returnedIndexUser.small_cropped_display_photo_key = smallCroppedImage;
          returnedIndexUser.tiny_cropped_display_photo_key = tinyCroppedImage;
          return User.Model.findById(result.user_profile_id)
        })
        .then((result) => {
          result.cropped_display_photo_key = croppedImage;
          result.small_cropped_display_photo_key = smallCroppedImage;
          result.tiny_cropped_display_photo_key = tinyCroppedImage;
          return Promise.all([returnedIndexUser.save(), result.save()]);
        })
        .then(
          () =>
            res.status(201).send("Display photo successfully changed!")
        )
        .catch((err) => {
          console.log(err);
          res.status(500).send()
        });
    })
  .delete(
    (req, res) => {
      const username = req.body.username;
      let returnedIndexUser = null;

      return IndexUser.Model.findOne({ username: username })
        .then((result) => {
          returnedIndexUser = result;
          if (returnedIndexUser.cropped_display_photo_key === '') {
            throw 204;
          }
          const displayPhotoKeys = [
            { Key: returnedIndexUser.cropped_display_photo_key },
            { Key: returnedIndexUser.small_cropped_display_photo_key },
            { Key: returnedIndexUser.tiny_cropped_display_photo_key }
          ];
          return Promise.all([User.Model.findById(returnedIndexUser.user_profile_id),
          AwsConstants.S3_INTERFACE.deleteObjects({

            Bucket: AwsConstants.BUCKET_NAME,
            Delete: {
              Objects: displayPhotoKeys
            }
          }, function (err, data) {
            if (err) {
              console.log(err, err.stack);
              throw new Error(err);
            }
            else { console.log("Success", data); }
          }).promise()])
        })
        .then((results) => {
          results[0].cropped_display_photo_key = "";
          results[0].small_cropped_display_photo_key = "";
          results[0].tiny_cropped_display_photo_key = "";
          returnedIndexUser.cropped_display_photo_key = "";
          returnedIndexUser.small_cropped_display_photo_key = "";
          returnedIndexUser.tiny_cropped_display_photo_key = "";
          return Promise.all([results[0].save(), returnedIndexUser.save()]);
        })
        .then(
          () =>
            res.status(201).send({ userId: returnedIndexUser.user_profile_id })
        )
        .catch((err) => {
          if (err === 204) {
            return res.status(204).json("No Content");
          }
          console.log(err);
          res.status(500).send()
        });

    })
  ;



router.route('/cover')
  .post(profileUpload.single("coverPhoto"), (req, res) => {
    console.log(req.file);
    const username = req.body.username;
    const coverPhoto = req.file.key;
    let returnedUser = null;
    if (!coverPhoto) return res.status(500).send("No Cover Image");
    return User.Model.findOne({ username: username })
      .then(
        (user) => {
          if (!user) throw new Error("Could not find user!");
          returnedUser = user;
          user.cover_photo_key = coverPhoto;
          return returnedUser.save();
        }
      )
      .then(() => res.status(200).send())
      .catch(err => { console.log(err); res.status(500).send(); })
  })
  .delete((req, res) => {
    const username = req.body.username;
    let returnedUser = null;
    return User.Model.findOne({ username: username }).then(
      (user) => {
        returnedUser = user;
        if (returnedUser.cover_photo_key === "") throw 204;
        return AwsConstants.S3_INTERFACE.deleteObject({
          Bucket: AwsConstants.BUCKET_NAME,
          Key: user.cover_photo_key,
        }, function (err, data) {
          if (err) {
            console.log(err, err.stack);
            throw new Error("Something went wrong while deleting the file from Amazon.", err)
          };
        });

      }
    )
      .then(() => {
        returnedUser.cover_photo_key = "";
        return returnedUser.save();
      })
      .then((res.status(204).send()))
      .catch((err) => {
        if (err === 204) {
          return res.status(204).json("No Content");
        }
        console.log(err);
        res.status(500).send()
      });

  });

module.exports = router;
