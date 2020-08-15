var express = require('express');
var router = express.Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');
let Post = require("../../models/post.model");
var firebase = require('firebase');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GridFsStorage = require("multer-gridfs-storage");
const multer = require('multer');
const uri = process.env.ATLAS_URI;
const crypto = require('crypto');
const AWS = require('aws-sdk');
const AwsConstants = require('../../constants/aws');
const multerS3 = require('multer-s3');


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
      cb(null, "images" + "/" + Date.now().toString() + Math.floor(Math.random() * Math.floor(2000)))
    }
  })
});

// const storage = new GridFsStorage({
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
//             bucketName: 'posts',
//           }
//           resolve(fileInfo)
//         })
//       })
//     },
//   })

// const upload = multer({ storage });


// router.route('/image/:filename').get( (req, res) => {
//     const gfs = req.image_config.gfs;
//     gfs.files.findOne({ filename: req.params.filename }, (err, file) => {

//         console.log(file);
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

// router.route('/').post( (req, res) => {
//     console.log("Made it");
//     console.log(req.body.text_content);
//     console.log(req.body.editor_content);
//     res.status(201).send();
// })

// router.route('/short').post((req, res) => {
//   console.log(req);
//   res.status(200);
// })

// New Stuff

const getImageUrls = (array) => {
  let imageArray = [];
  for (const imageFile of array){
    imageArray.push(imageFile.location);
  }
  return imageArray;
}
router.route('/').post(upload.fields([{name: "images"}, {name: "coverPhoto"}]), (req, res) => {
 
  console.log(req.files);
  console.log(req.file);
  console.log(req.body.min);
  const username = req.body.username;
  const title = !!req.body.title ? req.body.title : null;
  const private = !!req.body.private ? req.body.private : null;
  const coverPhotoURL = !!req.file ? req.file.cover.location : null;
  const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory  : null;
  const minDuration = !!req.body.minDuration ? req.body.minDuration : null;
  const postType = !!req.body.postType ? req.body.postType : null;
  const isMilestone = !!req.body.isMilestone ? req.body.isMilestone : null;
  const imageData = !!req.files ? getImageUrls(req.files.images) : [];

  let post = null;
  let resolveAuthorId = IndexUser.Model.findOne({ username: username }).then(
    indexUser => {
      return indexUser.user_profile_ref;}
  ).catch(
    err => {
      console.log(err);
      res.status(500).send(err);
    }
  );

  let resolveNewPost = resolveAuthorId.then( resolvedAuthorID => {
  switch (postType) {
    case ("short"):
      post = new Post.Model({
        title: title,
        private: private,
        author_id: resolvedAuthorID,
        pursuit_category: pursuitCategory,
        cover_photo_url: coverPhotoURL,
        post_format: postType,
        is_milestone: isMilestone,
        text_data: req.body.textData,
        image_data: imageData,
        min_duration: minDuration
      });
      break;
    case ("long"):
      post = new Post.Model({
        title: title,
        private: private,
        author_id: resolvedAuthorID,
        pursuit_category: pursuitCategory,
        cover_photo_url: coverPhotoURL,
        post_format: postType,
        is_milestone: isMilestone,
        text_data: req.body.textData,
        min_duration: minDuration
      });
      break;
    default:
      res.status(500).send();
  }

  return resolvedAuthorID;
}
);


  //save new post
  let resolveUser = resolveNewPost.then(
    (result) => 
     {
       console.log(result);
      return User.Model.findById(result);}
  );

  resolveUser.then(
    resolvedUser => {
      const user = resolvedUser;
      user.posts.push(post._id);
      user.recent_posts.push(post);
      //check if pursuits exists already
      if (minDuration) {
        for (const pursuit of user.pursuits) {
          if (pursuit.name === pursuitCategory) {
            if (isMilestone) pursuit.num_milestones += 1;
            pursuit.total_min += minDuration;
            pursuit.num_posts += 1;
            break;
          }
        }
      }
      return user;
    }
  ).
  then( user => 
    {
      user.save().catch(err => res.status(500).json('Error: ' + err));
      post.save().catch(err => res.status(500).json('Error: ' + err));
    }
    
    )
  .then(
    () =>  res.status(201).send()
  ).
  catch(
    (err) => {
      console.log(err);
      res.status(500).json(err);
    }
  )

})



module.exports = router;
