var express = require('express');
var router = express.Router();
let User = require('../../models/user.model');
let Post = require('../../models/draft.model');
let IndexUser = require('../../models/index.user.model');
let Pursuit = require('../../models/pursuit.model');
let IndexPursuit = require('../../models/index.pursuit.model');
var firebase = require('firebase');
const mongoose = require('mongoose');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const Schema = mongoose.Schema;
const uuid = require('uuid');
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
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "images/profile/" + uuid.v1())
    }
  })
});

//create user and indexUser
router.route('/')
.get((req, res) => {
    const username = req.query.username;
    User.Model.findOne({ username: username }).then(
      user => {
        if (user) res.status(200).json(user);
        else {
          res.status(204);
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
.post(upload.fields([{ name: "croppedImage"}, { name: "smallCroppedImage"}, { name: "tinyCroppedImage"}]),
 (req, res) => {
  // sharp(req.files)
  console.log(req.files);
  console.log(req.body);
  // res.send(200);
  
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
    small_cropped_display_photo : smallCroppedImage,
    tiny_cropped_display_photo: tinyCroppedImage,
    pursuits: mainPursuitsHolder,
    private: false
  });

  const newIndexUser = new IndexUser.Model({
    username: username,
    user_profile_ref: newUser._id,
    preferredPostType: "public-feed",
    cropped_display_photo: croppedImage,
    small_cropped_display_photo : smallCroppedImage,
    tiny_cropped_display_photo: tinyCroppedImage,
    private: false,
    draft: '',
    pursuits: indexPursuitsHolder
  });

  const resovlvedUser = newUser.save();
  const resolvedIndexUser = resovlvedUser.then(() => newIndexUser.save());
  resolvedIndexUser.then(() => res.status(201).json("Success!")).catch(err => {
    console.log(err);
    res.status(500).json(err);
  });

  // newUser.save().then(() => console.log("Saved 1")).catch(err => res.status(500).json(err));
  // console.log("123123");
  // newIndexUser.save().then(() => console.log("Saved 2")).catch(err => res.status(500).json(err));
  // console.log("343");
});

// router.delete('/', (req, res) => {
//   User.Model.deleteMany().then(() => res.json("Deleted All!"));
//   mongoose.connection.deleteModel('User');
// })



//create indexed user
// router.post('/index', (req, res) => {
//   const uid = req.body.uid;
//   const username = req.body.username;
//   const private = req.body.private;
//   const pursuitsArray = req.body.pursuits;
//   console.log(pursuitsArray);
//   let updatedPursuits = [];
//   const TitleModel = mongoose.model('Title', new Schema({
//     name: String,
//     numEvent: 0
//   }));
//   for (const pursuit of pursuitsArray) {
//     console.log(pursuit);
//     updatedPursuits.push(
//       new TitleModel({
//         name: pursuit,
//         numEvent: 0
//       })
//     );
//   }
//   const indexUser = IndexUser.Model({
//     uid: uid,
//     username: username,
//     private: private,
//     pursuits: updatedPursuits
//   });
//   indexUser.save()
//     .then(() => res.json('User Indexed!'))
//     .catch(err => res.status(400).json('Error: ' + err));
// })


// router.post('/register', (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;

//       firebase.auth().createUserWithEmailAndPassword(email, password)

//       .then(
//         ()=> {
//           //FIXME WHY DOESN'T (user) => {} work anymore?
//           // userData.user.sendEmailVerification();
//           firebase.auth().currentUser.sendEmailVerification();
//           res.send("Succesfully registed! Check you email for a verification link.")

//         }
//         )
//           // .then(window.location.replace('/'))
//       .catch( (error) => {
//         // Handle Errors here.
//         var errorCode = error.code;
//         var errorMessage = error.message;
//         // [START_EXCLUDE]
//         if (errorCode === 'auth/weak-password') {
//           res.send('The password is too weak.');
//         } else {
//           res.send(errorMessage);
//         }
//         console.log(error);
//         // [END_EXCLUDE]
//       });

// });

// router.get('/test', (req, res, next) => {
//   res.send("Success!")
// })


// PREVIOUS MONGODB CODE

// /* GET users listing. */
// router.get('/login', function(req, res, next) {
//   const email = req.body.email;
//   const password = req.body.password;

//   const user = new User({
//     email,
//     password,
//   });

//   User.find({email: user.email})
//   .then(users => res.json(users))
//   .catch(err => res.status(400).json('Error: ' + err));

//   // res.send('respond with a resource');
// });

// router.route('/add').post((req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   const firstName = req.body.firstName;
//   const lastName = req.body.lastName;

//   const newUser = new User({
//     email,
//     password,
//     firstName,
//     lastName,
//   });

//   newUser.save().then(() => res.json('User added!'))
//   .catch(err => res.status(400).json('Error: ' + err));

//   // const matchingUsers = User.find()
//   // .then(users => res.json(users))
//   // .catch(err => res.status(400).json('Error: ' + err));

//   // if (matchingUsers) {
//   //   console.log(matchingUsers);
//   // }

// })

module.exports = router;
