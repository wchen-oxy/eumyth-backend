const selectModel = require('../../../models/modelServices');
const ModelConstants = require('../../../models/constants');
const {
    findAndUpdateIndexUserMeta,
    updatePursuitObject
} = require('./services');
const { ADD } = require('./constants');

module.exports = (req, res, next) => {
    const username = req.body.username;
    const displayPhoto = req.body.displayPhoto;
    const userID = req.body.userID;
    const indexUserID = req.body.indexUserID;
    const userPreviewID = req.body.userPreviewID;
    const status = req.body.status;
    const pursuit = req.body.pursuit;

    const selectedPosts = req.body.selectedPosts ?
        req.body.selectedPosts : [];
    const title = req.body.title ? req.body.title : null;
    const overview = req.body.overview ? req.body.overview : null;
    const startDate = req.body.startDate ? req.body.startDate : null;
    const endDate = req.body.endDate ? req.body.endDate : null;
    const minDuration = req.body.minDuration ? req.body.minDuration : null;
    const labels = req.body.labels ? req.body.labels : [];
    const remix = req.body.remix ? req.body.remix : null;
    const miniCoverPhotoURL = req.files.miniCoverPhoto ? req.files.miniCoverPhoto[0].key : null;
    const coverPhotoURL = req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const newProject = selectModel(ModelConstants.PROJECT)
        (
            {
                username: username,
                index_user_id: indexUserID,
                display_photo_key: displayPhoto,
                title: title,
                overview: overview,
                pursuit: pursuit,
                start_date: startDate,
                end_date: endDate,
                status: status,
                min_duration: minDuration,
                cover_photo_key: coverPhotoURL,
                mini_cover_photo_key: miniCoverPhotoURL,
                post_ids: selectedPosts,
                labels: labels,
                project_preview_id: null,
                remix
            });

    const projectPreview = selectModel(ModelConstants.PROJECT_PREVIEW_WITH_ID)
        ({
            title: title,
            project_id: newProject._id,
            status: 'DRAFT',
            labels: labels,
            pursuit: pursuit,
            username: username
        });

    const resolvedIndexUser = findAndUpdateIndexUserMeta(
        ADD,
        indexUserID,
        pursuit,
        { title: newProject.title, content_id: newProject._id, project_preview_id: projectPreview._id }
    );
    newProject.project_preview_id = projectPreview._id;
    const resolvedUserPreview = updatePursuitObject(
        ModelConstants.USER_PREVIEW,
        userPreviewID,
        newProject._id,
        newProject.pursuit
    );

    const resolvedUser = updatePursuitObject(ModelConstants.USER, userID, newProject._id, newProject.pursuit);
    return Promise.all([resolvedIndexUser, resolvedUser, resolvedUserPreview])
        .then((result) => {
            const savedIndexUser = result[0].save();
            const savedUser = result[1].save();
            const savedUserPreview = result[2].save();
            const savedProject = newProject.save();
            const savedProjectPreview = projectPreview.save();
            const promisedSaves = [
                savedIndexUser,
                savedUser,
                savedUserPreview,
                savedProject,
                savedProjectPreview
            ];
            if (res.locals.parentProject) {
                const savedParentProject = res.locals.parentProject;
                savedParentProject.children.push(
                    new (selectModel(ModelConstants.PROJECT_PREVIEW_NO_ID)({
                        title,
                        remix,
                        project_id: newProject._id
                    })));
                promisedSaves.push(savedParentProject.save());
            }
            return Promise.all(promisedSaves);
        })
        .then((result) => {
            res.locals.selectedDraftID = newProject._id;
            return res.status(201).json({ 
                id: newProject._id,
                project_preview: newProject.project_preview_id 
             });
        })
        .catch(next)

}