var express = require('express');
var router = express.Router();
let User = require('../models/user.model');
let Draft = require('../models/draft.model');
// let IndexUser = require('../models/index.user.model');
var firebase = require('firebase');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GridFsStorage = require("multer-gridfs-storage");
const multer = require('multer');
const uri = process.env.ATLAS_URI;
const crypto = require('crypto');

const storage = new GridFsStorage({
    url: uri,
    file: (req, file) => {
      console.log(req.body);
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err)
          }
          const filename = file.originalname
          const fileInfo = {
            filename: filename,
            bucketName: 'images',
          }
          resolve(fileInfo)
        })
      })
    },
  })
const upload = multer({ storage });

router.route('/').get( (req, res) => {
    const db = req.draft_config.db;
    console.log(req.query);
    const username = req.query.username;
    console.log(username);
    db.collection('index-users').findOne({username:username})
    .then((user) => User.Model.findById(mongoose.Types.ObjectId(user.userProfileRef)))
    .then((user) => {
        console.log("Inner log");
        console.log(
            user.draft
        );
        res.send(user.draft.draftData);
    })    .catch(err => console.log('ERROR' + err));

})

router.route('/').post( (req, res) => {
    // console.log(req.body.username);
    // const username = req.body.username;
    // console.log(req);
    const username = req.headers.username;
    console.log(req.body.editor_content);
    const db = req.draft_config.db;
    // console.log(req.draft_config.db);

    // db.collection('index-users', function(err, collection){
    //     collection.find({username:username}, function(err, user){
    //         console.log("Inside");
    //         if (err) throw err;
    //         console.log(user);
    //         return user;
    //     });
    // });

    db.collection('index-users').findOne({username:username})
    .then((user) => {
           
            return User.Model.findById(mongoose.Types.ObjectId(user.userProfileRef));})
        .then((user) => {
            console.log(user);
            const draftModel = new Draft.Model({
                title : 'draft',
                draftData : req.body.editor_content,

                // draftData : req.body.editorState,
                type: 'long'
            });
            user.draft = draftModel;
            user.save().then(() => res.send(201));
        })
        .catch(err => console.log('ERROR' + err));
   
    // IndexUser.model.findOne({username: 'blackjamx5'}).then((user)=> console.log(user));
    
    
    // .find({$text : {$search: username}}, function(err, user){
    //     console.log("Inside");
    //     if (err) throw err;
    // }));
    // console.log(IndexUser.Model.find({$text : {$search: username}}, function(err, user){
    //     console.log("Isnide");
    //     if (err) throw err;
    // }));
    // IndexUser.find({$text : {$search: username}})
    // .then((user) => {
    //     console.log(user);
    //     return User.Model.findById(mongoose.Types.ObjectId(user.userProfileRef));})
    // .then((user) => {
    //     console.log(user);
    //     const draftModel = new Draft.Model({
    //         title : 'draft',
    //         draftData : req.body.editorState,
    //         type: 'long'
    //     });
    //     user.draft = draftModel;
    //     user.save();
    // })
    // .catch(err => console.log('ERROR' + err));
    // console.log(req.body);
})

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




module.exports = router;
