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
const uuid = require('uuid');


const setPusuitAttributes = (isMilestone, pursuit, minDuration) => {
  if (isMilestone) { pursuit.num_milestones = Number(pursuit.num_milestones ) + 1;}
  console.log(pursuit.total_min);
  pursuit.total_min = Number(pursuit.total_min) + minDuration;
  console.log(pursuit.total_min);
  pursuit.num_posts = Number(pursuit.num_posts) + 1;
  return pursuit;
}

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
  for (const imageFile of array) {
    console.log(imageFile.location)
    imageArray.push(imageFile.location);
  }
  return imageArray;
}


router.route('/').post(upload.fields([{ name: "images" }, { name: "coverPhoto", maxCount: 1 }]), (req, res) => {

  const postType = !!req.body.postType ? req.body.postType : null;
  const username = req.body.username;
  const title = !!req.body.previewTitle ? req.body.previewTitle : null;
  const postPrivacyType = !!req.body.postPrivacyType ? req.body.postPrivacyType : null;
  const pursuitCategory = !!req.body.pursuitCategory ? req.body.pursuitCategory : null;
  const date = !!req.body.date ? req.body.date : null;
  const textData = !!req.body.textData ? req.body.textData : null;
  const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
  const isMilestone = !!req.body.isMilestone ? req.body.isMilestone : null;
  const coverPhotoURL = req.files.coverPhoto ? req.files.coverPhoto[0].location : null;
  const imageData = req.files.images ? getImageUrls(req.files.images) : [];

  let post = null;
  let indexUser = null;
  const resolveIndexUser = IndexUser.Model.findOne({ username: username }).then(
    indexUserResult => {
      indexUser = indexUserResult;
      return indexUserResult;
    }
  ).catch(
    err => {
      console.log(err);
      res.status(500).send(err);
    }
  );

  let resolveNewPost = resolveIndexUser.then(resolvedIndexUser => {
    switch (postType) {
      case ("short"):
        post = new Post.Model({
          preview_title: title,
          private: postPrivacyType,
          date: date,
          author_id: resolvedIndexUser.user_profile_ref,
          pursuit_category: pursuitCategory,
          cover_photo_url: coverPhotoURL,
          post_format: postType,
          is_milestone: isMilestone,
          text_data: textData,
          image_data: imageData,
          min_duration: minDuration
        });
        break;
      case ("long"):
        post = new Post.Model({
          preview_title: title,
          private: postPrivacyType,
          author_id: resolvedIndexUser.user_profile_ref,
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

    indexUser.recent_posts.push(post);
    if (indexUser.preferred_post_type !== postPrivacyType) {
      indexUser.preferred_post_type = postPrivacyType;
    }
    if (minDuration) {
      for (const pursuit of indexUser.pursuits) {
        if (pursuit.name === pursuitCategory) {
          setPusuitAttributes(isMilestone, pursuit, minDuration);
          break;
        }
      }
    }

    return resolvedIndexUser.user_profile_ref;
  }
  );

  //save new post
  let resolveUser = resolveNewPost.then(
    (result) => {
      return User.Model.findById(result);
    }
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
            setPusuitAttributes(isMilestone, pursuit, minDuration);
            break;
          }
        }
      }
      return user;
    }
  ).


    // resolveIndexUser.then(
    //   (resolvedIndexUser) => {
    //     const indexUser = resolvedIndexUser;
    //     indexUser.recent_posts.push(post);
    //     if (indexUser.preferred_post_type !== postPrivacyType){
    //       indexUser.preferred_post_type = postPrivacyType;
    //     }
    //     if (minDuration) {
    //       for (const pursuit of indexUser.pursuits) {
    //         console.log(pursuit);
    //         if (pursuit.name === pursuitCategory) {
    //           if (isMilestone) pursuit.num_milestones += 1;
    //           pursuit.total_min += minDuration;
    //           pursuit.num_posts += 1;
    //           break;
    //         }
    //       }
    //     }
    //     return resolvedIndexUser;
    //   }
    // )


    then(user => {
      indexUser.save().catch(err => res.status(500).json('Error: ' + err));
      user.save().catch(err => res.status(500).json('Error: ' + err));
      post.save().catch(err => res.status(500).json('Error: ' + err));
    }

    )
    .then(
      () => res.status(201).send()
    ).
    catch(
      (err) => {
        console.log(err);
        res.status(500).json(err);
      }
    )

})



module.exports = router;
