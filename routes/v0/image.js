var express = require('express');
var router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3')
const uuid = require('uuid');

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
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, "images/content/" + Date.now().toString() + Math.floor(Math.random() * Math.floor(2000)))
    }
  })
});

router.route('/single').post(upload.single('file'), (req, res, err) => {
  console.log(req.file);
  return res.status(200).json({'imageUrl': req.file.location});
});


router.route('/multiple').post(upload.array('files'), (req, res, err) => {
  console.log(req.files);
  let imageArray = [];
  for (const imageFile of req.files){
    imageArray.push(imageFile.location);
  }
  return res.status(200).json({'imageUrls': imageArray});
});

module.exports = router;
