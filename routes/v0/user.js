const express = require('express');
const router = express.Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');
let Pursuit = require('../../models/pursuit.model');
let IndexPursuit = require('../../models/index.pursuit.model');
const UserRelation = require('../../models/user.relation.model');
const Draft = require("../../models/draft.model");
const MulterHelper = require('../../constants/multer').profileImageUpload;
const UserPreview = require('../../models/user.preview.model');

const { retrieveCompleteUserByUsername, retrieveIndexUser, retrieveIndexUserByUsername, } = require('../../data_access/dal');

const {
  doesValidationErrorExist,
  validateQueryUsername,
  validateBodyUsername,
  validateBodyFullNames,
  validateBodyIndexUserID,
  validateBodyText,
  validateBodyIsPrivate,
  validateBodyBio,
  validateBodyPursuitArray
} = require("../../utils/validators");
const { PUBLIC_FEED } = require('../../constants/flags');

const imageFields = [
  { name: "croppedImage" },
  { name: "smallCroppedImage" },
  { name: "tinyCroppedImage" }
];

router.route('/')
  .get(validateQueryUsername, doesValidationErrorExist, (req, res, next) => {
    const username = req.query.username;
    retrieveCompleteUserByUsername(username)
      .then(user => res.status(200).json(user))
      .catch(next)
  })
  .post(
    MulterHelper.fields(imageFields),
    validateBodyUsername,
    validateBodyFullNames,
    validateBodyPursuitArray,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const pursuitsArray = JSON.parse(req.body.pursuitArray);
      const croppedImage = req.files.croppedImage ? req.files.croppedImage[0].key : null;
      const smallCroppedImage = req.files.smallCroppedImage ? req.files.smallCroppedImage[0].key : null;
      const tinyCroppedImage = req.files.tinyCroppedImage ? req.files.tinyCroppedImage[0].key : null;

      let mainPursuitsHolder = [];
      let indexPursuitsHolder = [];

      for (const pursuit of pursuitsArray) {
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
        preferred_post_privacy: PUBLIC_FEED,
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

      return Promise.all([
        savedIndexUser,
        savedUser,
        savedUserRelation,
        savedUserPreview])
        .then(() => res.status(201).json("Success!"))
        .catch(next);
    });

router.route('/account-settings-info')
  .get(
    validateQueryUsername,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.query.username;
      return retrieveIndexUserByUsername(username)
        .then((result) => {
          let pursuitsJSON = {};
          for (const pursuit of result.pursuits) {
            pursuitsJSON[pursuit.name] = pursuit.meta_template ?
              pursuit.meta_template : "";
          }
          return res.status(200).json({
            _id: result._id,
            bio: result.bio,
            private: result.private,
            pursuits: pursuitsJSON,
            cropped_display_photo_key: result.cropped_display_photo_key
          });
        })
        .catch(next);
    });

router.route('/template')
  .put(validateBodyIndexUserID,
    validateBodyText,
    validateBodyPursuitArray,
    doesValidationErrorExist,
    (req, res, next) => {
      const userID = req.body.indexUserID;
      const templateText = req.body.text;
      const selectedPursuit = req.body.pursuitCategory;
      return retrieveIndexUserByID(userID)
        .then((result) => {
          let indexUser = result;
          for (let pursuit of indexUser.pursuits) {
            if (pursuit.name === selectedPursuit) {
              pursuit.meta_template = templateText;
            }
          }
          return indexUser.save();
        })
        .then(() => res.status(200).send())
        .catch(next);
    })

router.route('/bio')
  .get(validateQueryUsername,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.query.username;
      return retrieveCompleteUserByUsername(username)
        .then((result) => {
          return res.status(200).json({ bio: result.bio });
        })
        .catch(next)
    })
  .put(
    validateBodyUsername,
    validateBodyBio,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const bio = req.body.bio;
      console.log(req.body.username);
      return Promise.all([
        retrieveCompleteUserByUsername(username),
        retrieveIndexUserByUsername(username)])
        .then((results) => {
          results[0].bio = bio;
          results[1].bio = bio;
          return Promise.all([
            results[0].save(),
            results[1].save()]);
        })
        .then(() => res.status(201).send())
        .catch(next);
    })

router.route('/private')
  .put(validateBodyUsername,
    validateBodyIsPrivate,
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const isPrivate = req.body.private;
      return retrieveCompleteUserByUsername(username)
        .then((result) => {
          result.private = isPrivate;
          return result.save()
        })
        .then(() => res.status(200).send())
        .catch(next)
    })



module.exports = router;
