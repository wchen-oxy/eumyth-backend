const express = require('express');
const router = express.Router();
const MulterHelper = require('../../constants/multer');
const Project = require('../../models/project.model');
const {
    validateQueryProjectIDList,
    validateBodyUsername,
    validateBodyUserID,
    validateBodyIndexUserID,
    validateBodySelectedPosts,
    validateBodyTitle,
    doesValidationErrorExist,
    validateQueryProjectID,
} = require('../../utils/validators');
const { retrieveIndexUserByID, retrieveUserByID, findProjectByID, findProjectsByID } = require('../../data_access/dal');
const ContentPreview = require('../../models/content.preview.model');

router.route('/')
    .post(
        MulterHelper.contentImageUpload.single({ name: "coverPhoto", maxCount: 1 }),
        validateBodyUsername,
        validateBodyUserID,
        validateBodyIndexUserID,
        validateBodySelectedPosts,
        validateBodyTitle,
        doesValidationErrorExist,
        (req, res, next) => {
            const username = req.body.username;
            const displayPhoto = req.body.displayPhoto;
            const userID = req.body.userID;
            const indexUserID = req.body.indexUserID;
            const selectedPosts = req.body.selectedPosts ? JSON.parse(req.body.selectedPosts) : [];
            const title = req.body.title ? req.body.title : null;
            const overview = req.body.overview ? req.body.overview : null;
            const pursuit = req.body.pursuit ? req.body.pursuit : null;
            const startDate = req.body.startDate ? req.body.startDate : null;
            const endDate = req.body.endDate ? req.body.endDate : null;
            const isComplete = req.body.isComplete ? req.body.isComplete : null;
            const minDuration = req.body.minDuration ? req.body.minDuration : null;
            const coverPhotoURL = req.files ? req.files.coverPhoto[0].key : null;

            const newProject = new Project.Model({
                username: username,
                author_id: indexUserID,
                display_photo_key: displayPhoto,
                title: title,
                overview: overview,
                pursuit: pursuit,
                start_date: startDate,
                end_date: endDate,
                is_complete: isComplete,
                min_duration: minDuration,
                cover_photo_key: coverPhotoURL,
                post_ids: selectedPosts,
            });

            const resolvedIndexUser =
                retrieveIndexUserByID(indexUserID)
                    .then(result => {
                        let user = result;
                        if (pursuit) {
                            for (const pursuit of user.pursuits) {
                                if (pursuit.name === newProject.pursuit) {
                                    pursuit.num_projects++;
                                }
                            }
                        }
                        else {
                            user.pursuits[0].num_projects++;
                        }

                        return user;
                    });

            const resolvedUser =
                retrieveUserByID(userID)
                    .then((result => {
                        let user = result;
                        for (const pursuit of user.pursuits) {
                            if (pursuit.name === newProject.pursuit) {
                                pursuit.projects.unshift(
                                    new ContentPreview.Model({
                                        post_id: newProject._id,
                                    })
                                );
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
                .catch(next)

        });

router.route('/single').get(
    validateQueryProjectID,
    doesValidationErrorExist,
    (req, res, next) => {
        const projectID = req.query.projectID;
        return findProjectByID(projectID)
            .then(
                (result) => {
                    return res.status(200).json({ project: result });
                }
            )
            .catch(next)
    }
);


router.route('/multiple').get(
    validateQueryProjectIDList,
    doesValidationErrorExist,
    (req, res, next) => {
        const projectIDList = req.query.projectIDList;
        return findProjectsByID(projectIDList)
            .then(
                (results) => {
                    return res.status(200).json({ projects: results });
                }
            )
            .catch(next)
    }
);
module.exports = router;

