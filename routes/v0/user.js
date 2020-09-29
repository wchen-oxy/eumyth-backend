var express = require('express');
const mongoose = require('mongoose');
var router = express.Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');
let Pursuit = require('../../models/pursuit.model');
let IndexPursuit = require('../../models/index.pursuit.model');
const UserRelation = require('../../models/user.relation.model');
const upload = require('../../constants/multer').profileImageUpload;

// const s3 = new AWS.S3({
//   accessKeyId: AwsConstants.ID,
//   secretAccessKey: AwsConstants.SECRET
// });

// var upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: AwsConstants.BUCKET_NAME,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       cb(null, "images/profile/" + uuid.v1())
//     }
//   })
// });

router.route('/')
  .get((req, res) => {
    const username = req.query.username;
    User.Model.findOne({ username: username }).then(
      user => {
        if (user) res.status(200).json(user);
        else {
          res.status(204).send();
        }
      }
    ).catch(
      err => {
        console.log(err);
        res.status(500).json(err);
      }
    )
  }
  )
  .put(upload.fields([{ name: "croppedImage" }, { name: "smallCroppedImage" }, { name: "tinyCroppedImage" }]),
    (req, res) => {
      console.log(req.files);
      console.log(req.body);
      const username = req.body.username;
      const pursuitsArray = JSON.parse(req.body.pursuits);
      const croppedImage = req.files.croppedImage[0].location;
      const smallCroppedImage = req.files.smallCroppedImage[0].location;
      const tinyCroppedImage = req.files.tinyCroppedImage[0].location;

      let mainPursuitsHolder = [];
      let indexPursuitsHolder = [];
      for (const pursuit of pursuitsArray) {
        console.log(pursuit);
        console.log(pursuit.name);

        mainPursuitsHolder.push(
          new Pursuit.Model({
            name: pursuit.name,
            display_photo: "",
            private: false,
            experience_level: pursuit.experience,
            total_min: 0,
            num_posts: 0,
            num_milestones: 0,
          }));

        indexPursuitsHolder.push(
          new IndexPursuit.Model({
            name: pursuit.name,
            experience_level: pursuit.experience,
            num_posts: 0,
            num_milestones: 0,
            total_min: 0,
          })
        );
      }

      const newUser = new User.Model({
        username: username,
        cropped_display_photo: croppedImage,
        small_cropped_display_photo: smallCroppedImage,
        tiny_cropped_display_photo: tinyCroppedImage,
        pursuits: mainPursuitsHolder,
        private: false
      });

      const newIndexUser = new IndexUser.Model({
        username: username,
        user_profile_id: newUser._id,
        preferredPostType: "public-feed",
        cropped_display_photo: croppedImage,
        small_cropped_display_photo: smallCroppedImage,
        tiny_cropped_display_photo: tinyCroppedImage,
        private: false,
        draft: null,
        pursuits: indexPursuitsHolder
      });

      const newUserRelation = new UserRelation.Model({
        parent_user_id: newUser._id,
      });

      newUser.user_relation_array_id = newUserRelation._id;
      const resovlvedUser = newUser.save();
      const resolvedIndexUser = resovlvedUser.then(() => newIndexUser.save());
      const resolvedUserRelation = resolvedIndexUser.then(() => newUserRelation.save());
      resolvedUserRelation.then(() => res.status(201).json("Success!")).catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
    });

module.exports = router;
