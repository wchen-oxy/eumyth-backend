var express = require('express');
var router = express.Router();
let User = require('../models/user.model');
let IndexUser = require('../models/index.user.model');
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

// router.route('/').post((req, res) => {
//   console.log(req.body);
//   console.log("Made it");
//   res.status(200).send();
// })

router.route('/image/:filename').get( (req, res) => {
    const gfs = req.image_config.gfs;
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
       
        console.log(file);
        // Check if file
        if (!file || file.length === 0) {
          return res.status(404).json({
            err: 'No file exists',
          })
        }
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
          // Read output to browser
          const readstream = gfs.createReadStream(file.filename);
          readstream.pipe(res);
        //   .on('err', err => console.log(err));
        } else {
          res.status(404).json({
            err: 'Not an image',
          })
        }
      });
})

router.route('/image').post(upload.single('file'), (req, res) => {
    console.log("Made it");
    console.log(req.body)
    res.status(201).send({url: "https://pngimg.com/uploads/cat/cat_PNG50504.png"});
})



module.exports = router;
