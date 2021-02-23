var express = require('express');
var router = express.Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');
let Pursuit = require('../../models/pursuit.model');
let IndexPursuit = require('../../models/index.pursuit.model');
const UserRelation = require('../../models/user.relation.model');
const Draft = require("../../models/draft.model");
const MulterHelper = require('../../constants/multer').profileImageUpload;
const UserPreview = require('../../models/user.preview.model');

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
  .post(MulterHelper.fields([{ name: "croppedImage" }, { name: "smallCroppedImage" }, { name: "tinyCroppedImage" }]),
    (req, res) => {
      console.log(req.files);
      console.log(req.body);
      const username = req.body.username;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const pursuitsArray = JSON.parse(req.body.pursuits);
      const croppedImage = req.files.croppedImage ? req.files.croppedImage[0].key : null;
      const smallCroppedImage = req.files.smallCroppedImage ? req.files.smallCroppedImage[0].key : null;
      const tinyCroppedImage = req.files.tinyCroppedImage ? req.files.tinyCroppedImage[0].key : null;

      let mainPursuitsHolder = [];
      let indexPursuitsHolder = [];
      for (const pursuit of pursuitsArray) {
        console.log(pursuit);
        console.log(pursuit.name);

        mainPursuitsHolder.push(
          new Pursuit.Model({
            name: pursuit.name,
            display_photo_key: "",
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
            num_projects: 0,
            total_min: 0,
          })
        );
      }

      const newUser =
        new User.Model({
          username: username,
          cropped_display_photo_key: croppedImage,
          small_cropped_display_photo_key: smallCroppedImage,
          tiny_cropped_display_photo_key: tinyCroppedImage,
          pursuits: mainPursuitsHolder,
          private: false
        });

      const newIndexUser = new IndexUser.Model({
        username: username,
        user_profile_id: newUser._id,
        preferredPostType: "public-feed",
        cropped_display_photo_key: croppedImage,
        small_cropped_display_photo_key: smallCroppedImage,
        tiny_cropped_display_photo_key: tinyCroppedImage,
        private: false,
        draft: new Draft.Model({
          text: null,
          links: []
        }),
        pursuits: indexPursuitsHolder
      });

      const newUserRelation = new UserRelation.Model({
        parent_index_user_id: newIndexUser._id,
      });

      const newUserPreview = new UserPreview.Model({
        parent_index_user_id: newIndexUser._id,
        user_relation_id: newUserRelation._id,
        username: username,
        first_name: firstName,
        last_name: lastName,
        small_cropped_display_photo_key: smallCroppedImage,
        tiny_cropped_display_photo_key: tinyCroppedImage,
      })

      newUser.user_preview_id = newUserPreview._id;
      newUser.user_relation_id = newUserRelation._id;
      newIndexUser.user_preview_id = newUserPreview._id;
      newIndexUser.user_relation_id = newUserRelation._id;
      newUser.index_user_id = newIndexUser._id;

      const savedUser = newUser.save();
      const savedIndexUser = newIndexUser.save();
      const savedUserRelation = newUserRelation.save();
      const savedUserPreview = newUserPreview.save();

      return Promise.all([savedIndexUser, savedUser, savedUserRelation, savedUserPreview])
        .then(() => res.status(201).json("Success!"))
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
    });

router.route('/account-settings-info')
  .get((req, res) => {
    const username = req.query.username;
    return User.Model.findOne({ username: username })
      .then((result) => {
        return res.status(200).json({ bio: result.bio, private: result.private });
      })
      .catch(
        (err) => {
          console.log(err);
          res.status(500).send();
        }
      )
  });

router.route('/bio')
  .get((req, res) => {
    const username = req.query.username;
    return User.Model.findOne({ username: username })
      .then((result) => {
        return res.send(result.bio);
      })
      .catch(
        (err) => {
          console.log(err);
          res.status(500).send();
        }
      )
  })
  .put((req, res) => {
    const username = req.body.username;
    const bio = req.body.bio;

    return User.Model.findOne({ username: username })
      .then((result) => {
        result.bio = bio;
        return result.save();
      })
      .then(() => res.status(201).send())
      .catch((err) => {
        console.log(err);
        res.status(500).send()
      });
  })

router.route('/private').put((req, res) => {
  const username = req.body.username;
  const isPrivate = req.body.private;
  return User.Model.findOne({ username: username })
    .then((result) => {
      if (result === null) throw 204;
      result.private = isPrivate;
      return result.save()
    })
    .then(() => res.status(200).send())
    .catch((err) => {
      if (err === 204) res.status(500).send("No User Found");
      console.log(err);
      res.status(500).send();
    })
})



module.exports = router;
