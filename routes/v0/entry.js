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
            bucketName: 'posts',
          }
          resolve(fileInfo)
        })
      })
    },
  })
  
const upload = multer({ storage });


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

router.route('/').post( (req, res) => {
    console.log("Made it");
    console.log(req.body.text_content);
    console.log(req.body.editor_content);
    res.status(201).send();
})

router.route('/short').post((req, res) => {
  console.log(req);
  res.status(200);
})


module.exports = router;
