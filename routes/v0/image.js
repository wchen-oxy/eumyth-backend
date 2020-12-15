var express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3')
const uuid = require('uuid');
const User = require('../../models/user.model');
// const profileUpload = require('../../constants/multer').profileImageUpload;

const s3 = new AWS.S3({
  accessKeyId: AwsConstants.ID,
  secretAccessKey: AwsConstants.SECRET
});

var upload = multer({
  storage: multerS3({
    s3: s3,
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
    s3: s3,
    bucket: AwsConstants.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "images/profile/" + uuid.v1())
    }
  })
}, (err) => console.log(err));

router.route('/').post(upload.single('file'), (req, res, err) => {
  console.log(req.file);
  return res.status(200).json({ 'url': req.file.key });
})

router.route('/single').post(upload.single('file'), (req, res, err) => {
  console.log(req.file);
  return res.status(200).json({ 'imageUrl': req.file.key });
});


router.route('/multiple').post(upload.array('files'), (req, res, err) => {
  console.log(req.files);
  let imageArray = [];
  for (const imageFile of req.files) {
    imageArray.push(imageFile.key);
  }
  return res.status(200).json({ 'imageUrls': imageArray });
});



router.route('/cover')
  .post(profileUpload.single("coverPhoto"), (req, res) => {
    console.log(req.file.coverPhoto);

    console.log(req.file); console.log('Cover');
    const username = req.body.displayName;
    const coverPhoto = req.file[0].key;
    let returnedUser = null;
    if (!coverPhoto) return res.status(500).send("No Cover Image");
    return User.Model.findOne({ username: username })
      .then(
        (user) => {
          if (!user) throw new Error("Could not find user!");
          returnedUser = user;
          user.cover_photo = coverPhoto;
          if (user.cover_photo !== "") {
            return s3.deleteObject({
              Bucket: AwsConstants.BUCKET_NAME,
              Key: user.cover_photo,
            }, function (err, data) {
              if (err) {console.log(err, err.stack);
              throw new Error("Something went wrong while deleting the file from Amazon.", err)};
            });
          }
          return;
        }
      )
      .then(() => {
        returnedUser.cover_photo = coverPhoto;
        return returnedUser.save();
      })
      .then(() => res.status(200).send())
      .catch(err => { console.log(err); res.status(500).send(); })
  })
  .delete((req, res) => {
    const username = req.body.username;
    const contentType = req.body.contentType;
    let returnedUser = null;

    // s3.deleteObject({
    //   Bucket: AwsConstants.BUCKET_NAME,
    //   Key: user.cover_photo,
      
    // })
    return User.Model.findOne({ username: username }).then(
      (user) => {
        returnedUser = user;
        return s3.deleteObject({
          Bucket: AwsConstants.BUCKET_NAME,
          Key: user.cover_photo,
        }, function (err, data) {
          if (err) {console.log(err, err.stack);
            throw new Error("Something went wrong while deleting the file from Amazon.", err)};
        });

      }
    )
      .then(() => {
        returnedUser.cover_photo = "";
        return returnedUser.save();
      })
      .then((res.status(204).send()))
      .catch((err) => {
        console.log(err);
        res.status(500).send()
      });



    //delete the s3 bucket first
    //then delete the references to it
    //then delete post references to it


    return res.status(200).send();
  })

module.exports = router;
