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
router.route('/').post((req, res) => {
  console.log("Made it");
  const username = req.body.username;
  const title = !!req.body.title ? req.body.title : '';
  const private = req.body.private;
  const coverPhotoURL = req.body.cover
  const pursuitCategory = req.body.pursuitCategory;
  const minDuration = req.body.minDuration;
  const postFormat = req.body.post_format;
  const isMilestone = req.body.isMilestone;

  let post = null;
  let authorId = null;
  let authorId = IndexUser.Model.findOne({ username: username }).then(
    indexUser => indexUser.user_profile_ref
  ).catch(
    err => {
      console.log(err);
      res.status(500).send(err);
    }
  );

  // let user = IndexUser.Model.findOne({ username: username },
  //   (err, indexUser) => {
  //     if (err) res.status(500).send(err);
  //     authorId = new mongoose.mongo.ObjectId(indexUser.user_profile_ref);
  //     return User.Model.findById(authorId);
  //   }
  // )
  // .catch(
  //   err => {
  //     console.log(err);
  //     res.status(500).send(err);
  //   }
  // );


  //create new post

  switch (postFormat) {
    case ("text"):
      post = new Post.Model({
        title: title,
        private: private,
        author_id: authorId,
        pursuit_category: pursuitCategory,
        post_format: postFormat,
        is_milestone: isMilestone,
        text_data: req.body.textData,
        min_duration: minDuration
      });
      break;
    case ("short"):
      post = new Post.Model({
        title: title,
        private: private,
        author_id: authorId,
        pursuit_category: pursuitCategory,
        cover_photo_url: coverPhotoURL,
        post_format: postFormat,
        is_milestone: isMilestone,
        text_data: req.body.textData,
        image_data: req.body.imageData,
        min_duration: minDuration
      });
      break;
    case ("long"):
      post = new Post.Model({
        title: title,
        private: private,
        author_id: authorId,
        pursuit_category: pursuitCategory,
        cover_photo_url: coverPhotoURL,
        post_format: postFormat,
        is_milestone: isMilestone,
        text_data: req.body.textData,
        min_duration: minDuration
      });
      break;
    default:
      res.status(500).send();

  }

  //save new post
  post.save().catch(err => res.status(500).json('Error: ' + err));
  User.Model.findById(authorId).then(
    user => {
      // let posts = user.posts;
      // let recentPosts = user.recent_posts;
      // let pursuits = user.pursuits;
      user.posts.append(post._id);
      user.recent_posts.append(post);
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
      user.save(err => res.status(500).send(err));
    }
  );
  console.log(req.body.text_content);
  console.log(req.body.editor_content);
  res.status(201).send();
})



module.exports = router;
