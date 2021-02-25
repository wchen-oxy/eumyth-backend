const express = require('express');
const router = express.Router();
const User = require('../../models/user.model');
const IndexUser = require('../../models/index.user.model');
const MulterHelper = require('../../constants/multer');
const Project = require('../../models/project.model');


router.route('/').post(MulterHelper.contentImageUpload.single({ name: "coverPhoto", maxCount: 1 }), (req, res) => {
    const username = req.body.username;
    const displayPhoto = req.body.displayPhoto;
    const userId = req.body.userId;
    const indexUserId = req.body.indexUserId;
    const selectedPosts = req.body.selectedPosts ? JSON.parse(req.body.selectedPosts) : [];
    const title = req.body.title ? req.body.title : null;
    const overview = req.body.overview ? req.body.overview : null;
    const pursuitCategory = req.body.pursuitCategory ? req.body.pursuitCategory : null;
    const startDate = req.body.startDate ? req.body.startDate : null;
    const endDate = req.body.endDate ? req.body.endDate : null;
    const isComplete = req.body.isComplete ? req.body.isComplete : null;
    const minDuration = req.body.minDuration ? req.body.minDuration : null;
    const coverPhotoURL = req.files ? req.files.coverPhoto[0].key : null;

    const newProject = new Project.Model({
        username: username,
        author_id: indexUserId,
        display_photo_key: displayPhoto,
        title: title,
        overview: overview,
        pursuit: pursuitCategory,
        start_date: startDate,
        end_date: endDate,
        is_complete: isComplete,
        min_duration: minDuration,
        cover_photo_key: coverPhotoURL,
        post_ids: selectedPosts,
    });

    const resolvedIndexUser = IndexUser.Model.findById(indexUserId).then(result => {
        let user = result;
        for (const pursuit of user.pursuits) {
            if (pursuit.name === newProject.pursuit) {
                pursuit.num_projects++;
            }
        }

        return user;
    });
    const resolvedUser = User.Model.findById(userId).then((result => {
        let user = result;
        for (const pursuit of user.pursuits) {
            if (pursuit.name === newProject.pursuit) {
                pursuit.projects.unshift(newProject._id);
            }
        }
        return user;

    }));

    return Promise.all([resolvedIndexUser, resolvedUser])
        .then((result) => {
            const savedIndexUser = result[0].save();
            const savedUser = result[1].save();
            const savedProject = newProject.save();
            return (Promise.all([savedIndexUser, savedUser, savedProject]));
        })
        .then((result) => {
            return res.status(201).send();
        })
        .catch(error => {
            console.log(error);
            return res.status(500).send();
        })

});

router.route('/multiple').get((req, res) => {
    const projectIdList = req.query.projectIdList;
    return Project.Model.find({
        '_id': { $in: projectIdList }, function(err, docs) {
            if (err) console.log(err);
            else {
                console.log(docs);
            }
        }
    })
        .then(
            (results) => {
                console.log(results);
                return res.status(200).send(results);
            }
        )
        .catch(error => {
            console.log(error);
            return res.status(500).send();
        })
}
);
module.exports = router;

