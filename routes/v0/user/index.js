const express = require('express');
const router = express.Router();
const MulterHelper = require('../../../shared/utils/multer').profileImageUpload;
const { findOne, findByID, findByIDAndUpdate } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const {
  PARAM_CONSTANTS,
  buildQueryValidationChain,
  buildBodyValidationChain,
  doesValidationErrorExist,
} = require("../../../shared/validators/validators");
const { PUBLIC_FEED } = require('../../../shared/utils/flags');
const selectModel = require('../../../models/modelServices');

const imageFields = [
  { name: "croppedImage" },
  { name: "smallCroppedImage" },
  { name: "tinyCroppedImage" }
];

router.route('/')
  .get(
    buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.query.username;
      findOne(ModelConstants.USER, { username: username })
        .then(user => res.status(200).json(user))
        .catch(next)
    })
  .post(
    MulterHelper.fields(imageFields),
    buildBodyValidationChain(
      PARAM_CONSTANTS.USERNAME,
      PARAM_CONSTANTS.FIRST_NAME,
      PARAM_CONSTANTS.LAST_NAME,
      PARAM_CONSTANTS.PURSUIT_ARRAY
    ),
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


      mainPursuitsHolder.push(
        new (selectModel(ModelConstants.PURSUIT))({
          name: "ALL",
          display_photo_key: "",
          private: false,
          total_min: 0,
          num_posts: 0,
          posts: [],
          projects: [],
        }));

      indexPursuitsHolder.push(
        new (selectModel(ModelConstants.INDEX_PURSUIT))({
          name: "ALL",
          num_posts: 0,
          num_projects: 0,
          total_min: 0,
        })
      );

      for (const pursuit of pursuitsArray) {
        mainPursuitsHolder.push(
          new (selectModel(ModelConstants.PURSUIT))
            ({
              name: pursuit.name.toUpperCase(),
              display_photo_key: "",
              private: false,
              experience_level: pursuit.experience.toUpperCase(),
              total_min: 0,
              num_posts: 0,
              posts: [],
              projects: [],
            }));

        indexPursuitsHolder.push(
          new (selectModel(ModelConstants.INDEX_PURSUIT))
            ({
              name: pursuit.name.toUpperCase(),
              experience_level: pursuit.experience.toUpperCase(),
              num_posts: 0,
              num_projects: 0,
              total_min: 0,
            })
        );
      }

      const newFeed = new (selectModel(ModelConstants.FEED))
        ({
          following: [],
          parents: [],
          siblings: [],
          children: [],
        })

      const newUser =
        new (selectModel(ModelConstants.USER))
          ({
            username: username,
            cropped_display_photo_key: croppedImage,
            small_cropped_display_photo_key: smallCroppedImage,
            tiny_cropped_display_photo_key: tinyCroppedImage,
            pursuits: mainPursuitsHolder,
            private: false,
            pinned_posts: [],
            pinned_projects: [],
            requests: [],
            labels: [],
            cached_feed_id: newFeed._id,
          });

      const newIndexUser =
        new (selectModel(ModelConstants.INDEX_USER))
          ({
            username: username,
            user_profile_id: newUser._id,
            preferred_post_privacy: PUBLIC_FEED,
            cropped_display_photo_key: croppedImage,
            small_cropped_display_photo_key: smallCroppedImage,
            tiny_cropped_display_photo_key: tinyCroppedImage,
            private: false,
            notifications: [],
            pursuits: indexPursuitsHolder,
            following_feed: [],
            cached_feed_id: newFeed._id,
            labels: [],
          });

      const newUserPreview =
        new (selectModel(ModelConstants.USER_PREVIEW))
          ({
            parent_index_user_id: newIndexUser._id,
            parent_user_id: newUser._id,
            username: username,
            first_name: firstName,
            last_name: lastName,
            small_cropped_display_photo_key: smallCroppedImage,
            tiny_cropped_display_photo_key: tinyCroppedImage,
            pursuits: mainPursuitsHolder,
            location: { coordinates: [] }
          });
          console.log(newUserPreview);
      const newUserRelation =
        new (selectModel(ModelConstants.USER_RELATION))
          ({
            parent_index_user_id: newIndexUser._id,
            user_preview_id: newUserPreview._id
          });

      newIndexUser.user_preview_id = newUserPreview._id;
      newIndexUser.user_relation_id = newUserRelation._id;
      newUserPreview.user_relation_id = newUserRelation._id;
      newUser.index_user_id = newIndexUser._id;
      newUser.user_relation_id = newUserRelation._id;
      newUser.user_preview_id = newUserPreview._id;

      const savedFeed = newFeed.save();
      const savedUser = newUser.save();
      const savedIndexUser = newIndexUser.save();
      const savedUserRelation = newUserRelation.save();
      const savedUserPreview = newUserPreview.save();

      return Promise.all([
        savedFeed,
        savedIndexUser,
        savedUser,
        savedUserRelation,
        savedUserPreview])
        .then(() => res.status(201).json("Success!"))
        .catch(next);
    });

router.route('/account-settings-info')
  .get(
    buildQueryValidationChain(PARAM_CONSTANTS.USERNAME),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.query.username;
      return findOne(ModelConstants.INDEX_USER, { username: username })
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
  .put(
    buildBodyValidationChain(
      PARAM_CONSTANTS.INDEX_USER_ID,
      PARAM_CONSTANTS.TEXT,
      PARAM_CONSTANTS.PURSUIT_ARRAY
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const userID = req.body.indexUserID;
      const templateText = req.body.text;
      const selectedPursuit = req.body.pursuitCategory;
      return findByID(ModelConstants.INDEX_USER, userID)
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
  .get(
    buildQueryValidationChain(
      PARAM_CONSTANTS.USERNAME
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.query.username;
      return findOne(ModelConstants.USER, { username: username })
        .then((result) => {
          return res.status(200).json({ bio: result.bio });
        })
        .catch(next)
    })
  .put(
    buildBodyValidationChain(
      PARAM_CONSTANTS.USER_ID,
      PARAM_CONSTANTS.USER_PREVIEW_ID,
      PARAM_CONSTANTS.INDEX_USER_ID,
      PARAM_CONSTANTS.BIO
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const userID = req.body.userID;
      const indexUserID = req.body.indexUserID;
      const userPreviewID = req.body.userPreviewID;
      const bio = req.body.bio;
      return Promise.all([
        findByIDAndUpdate(ModelConstants.USER, userID, { bio }),
        findByIDAndUpdate(ModelConstants.INDEX_USER, indexUserID, { bio }),
        findByIDAndUpdate(ModelConstants.USER_PREVIEW, userPreviewID, { bio })
      ])
        .then(() => res.status(201).send())
        .catch(next);
    })

router.route('/private')
  .put(
    buildBodyValidationChain(
      PARAM_CONSTANTS.USERNAME,
      PARAM_CONSTANTS.IS_PRIVATE
    ),
    doesValidationErrorExist,
    (req, res, next) => {
      const username = req.body.username;
      const isPrivate = req.body.isPrivate;
      return Promise.all([
        findOne(ModelConstants.USER, { username: username }),
        findOne(ModelConstants.INDEX_USER, { username: username })
      ])
        .then((result) => {
          const completeUser = result[0];
          const indexUser = result[1];
          completeUser.private = isPrivate;
          indexUser.private = isPrivate;
          return Promise.all([result[0].save(), result[1].save()])
        })
        .then(() => res.status(200).send())
        .catch(next)
    })


module.exports = router;
