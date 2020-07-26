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
let IndexUser = require('../models/index.user.model');


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

router.route('/').get((req, res) => {
    const db = req.draft_config.db;
    const username = req.query.username;
    IndexUser.Model.findOne({username: username})
        .then((user) => User.Model.findById(mongoose.Types.ObjectId(user.userProfileRef)))
        .then((user) => {
            if (user.draft === undefined) {
                
                return res.sendStatus(404);}
            res.send(user.draft.draftData);
        }).catch(err => console.log('ERROR' + err));

})

router.route('/').post((req, res) => {

    const username = req.headers.username;
    const db = req.draft_config.db;
    IndexUser.Model.findOne({username: username})
        .then((user) => User.Model.findById(mongoose.Types.ObjectId(user.userProfileRef)))
        .then((user) => {
            const draftModel = new Draft.Model({
                title: 'draft',
                draftData: req.body.editor_content,
                type: 'long'
            });
            if (user.draft === draftModel ) res.sendStatus(200);
            user.draft = draftModel;
            user.save().then(() => res.sendStatus(201));
        })
        .catch(err => console.log('ERROR' + err));

})

module.exports = router;
