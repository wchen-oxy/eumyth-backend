var express = require('express');
var router = express.Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');
var firebase = require('firebase');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GridFsStorage = require("multer-gridfs-storage");
const multer = require('multer');
const uri = process.env.ATLAS_URI;
const crypto = require('crypto');
const fs = require('fs');
const AWS = require('aws-sdk');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3')



const s3 = new AWS.S3({
  accessKeyId: AwsConstants.ID,
  secretAccessKey: AwsConstants.SECRET
});

// const uploadFile = (fileName) => {
//   // Read content from the file
//   const fileContent = fs.readFileSync(fileName);

//   // Setting up S3 upload parameters
//   const params = {
//       Bucket: AwsConstants.BUCKET_NAME,
//       Key: 'cat.jpg', // File name you want to save as in S3
//       Body: fileContent
//   };

//   // Uploading files to the bucket
//   s3.upload(params, function(err, data) {
//       if (err) {
//           throw err;
//       }
//       console.log(`File uploaded successfully. ${data.Location}`);
//   });
// };

//   const storage = new GridFsStorage({
//     url: uri,
//     file: (req, file) => {
//       console.log(req.body);
//       return new Promise((resolve, reject) => {
//         crypto.randomBytes(16, (err, buf) => {
//           if (err) {
//             return reject(err)
//           }
//           const filename = file.originalname
//           const fileInfo = {
//             filename: filename,
//             bucketName: 'images',
//           }
//           resolve(fileInfo)
//         })
//       })
//     },
//   })
// const upload = multer({ storage });

// router.route('/:id').get( (req, res) => {
//     const gfs = req.image_config.gfs;
//     gfs.files.findOne({ _id: new mongoose.mongo.ObjectId(req.params.id)}, (err, file) => {
//         // Check if file
//         if (!file || file.length === 0) {
//           return res.status(404).json({
//             err: 'No file exists',
//           })
//         }
//         // Check if image
//         if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
//           // Read output to browser
//           const readstream = gfs.createReadStream(file.filename);
//           readstream.pipe(res);
//         //   .on('err', err => console.log(err));
//         } else {
//           res.status(404).json({
//             err: 'Not an image',
//           })
//         }
//       });
// })

// router.route('/').post( upload.single('file'), (req, res, err) => {
//     console.log("Finished");
//     console.log(req.file);
//     if (err) throw err;
//     res.status(201).send({url: 'http://localhost:5000/image/' + req.file.id});
//   })

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


// metadata: function (req, file, cb) {
//   cb(null, {fieldName: file.fieldname});
// },
// key: function (req, file, cb) {
//   cb(null, Date.now().toString())
// }
// })
// });

// const multipleUpload = upload.array('files');

// router.route('/').post((req, res, err) => {
// if (err) {
// console.log(err)
// res.status(500).send(err);
// };

// multipleUpload(req, res, (err) => {
// if (err) {
//   return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
// }
// return res.json({'imageUrl': req.file.location});
// })
// // console.log(req.files);
// // res.status(200).send("Successful Upload!");
// // console.log(req.body);
// // uploadFile(req.body.imageArray);
// // return res.status(200).json({'imageUrl': req.file.location});
// });


module.exports = router;
