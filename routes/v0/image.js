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
const fs = require('fs');


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

router.route('/:id').get( (req, res) => {
    const gfs = req.image_config.gfs;
    gfs.files.findOne({ _id: new mongoose.mongo.ObjectId(req.params.id)}, (err, file) => {
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

router.route('/').post( upload.single('file'), (req, res, err) => {
    console.log("Finished");
    console.log(req.file);
    if (err) throw err;
    res.status(201).send({url: 'http://localhost:5000/image/' + req.file.id});
  })




module.exports = router;