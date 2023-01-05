const { findByID, findManyByID } = require('../../../data-access/dal');
const postServices = require('./services');
const projectServices = require('../project/services');
const selectModel = require('../../../models/modelServices');
const { checkStringBoolean, verifyArray } = require("../../../shared/helper");
const ModelConstants = require('../../../models/constants');

const loadParentThread = (req, res, next) => {
    const selectedDraft = req.body.selectedDraftID;
    return findByID(ModelConstants.PROJECT, selectedDraft)
        .then((result) => {
             res.locals.project = result;
            return next();
        });
}

const loadProjectPreview = (req, res, next) => {
    const isCompleteProject = req.body.completeProject ? req.body.completeProject : false;
    if (isCompleteProject) {
        return selectModel(ModelConstants.PROJECT_PREVIEW_WITH_ID)
            .findOne({ project_id: res.locals.project._id })
            .then((result) => {
                res.locals.projectPreview = result;
                return next();
            });
    }
    return next();
}

const loadPostCreation = (req, res, next) => {
    const username = req.body.username;
    const postPrivacyType = req.body.postPrivacyType;
    const pursuitCategory = req.body.pursuit ? req.body.pursuit.toUpperCase() : res.locals.project.pursuit.toUpperCase();
    const isPaginated = checkStringBoolean(req.body.isPaginated);
    const displayPhoto = req.body.displayPhoto ? req.body.displayPhoto : null;
    const difficulty = req.body.difficulty ? req.body.difficulty : null;
    const title = req.body.title ? req.body.title : null;
    const labels = req.body.labels ? verifyArray(req.body.labels) : [];
    const date = req.body.date ? new Date(req.body.date) : null;
    const textData = req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const coverPhotoKey = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const imageData = req.files && req.files.images ? postServices.getImageUrls(req.files.images) : [];
    const textSnippet = textData ? postServices.makeTextSnippet(isPaginated, textData) : null;
    const indexUser = res.locals.indexUser;
    let project = res.locals.project;

    const post = postServices.createPost(
        username,
        title,
        postPrivacyType,
        date,
        indexUser.user_profile_id,
        pursuitCategory,
        displayPhoto,
        coverPhotoKey,
        isPaginated,
        imageData,
        textSnippet,
        textData,
        minDuration,
        difficulty,
        labels,
        project.project_preview_id
    );
    res.locals.post = post;
    return next();
}

const updateMetaInfo = (req, res, next) => {
    const postPrivacyType = req.body.postPrivacyType;
    const pursuitCategory = req.body.pursuit ? req.body.pursuit : res.locals.project.pursuit;
    const labels = req.body.labels ? verifyArray(req.body.labels) : [];
    const date = req.body.date ? new Date(req.body.date) : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const indexUser = res.locals.indexUser;
     let post = res.locals.post;
    let project = res.locals.project;

    const isCompleteProject = req.body.completeProject ? checkStringBoolean(req.body.completeProject) : false;
    const user = res.locals.completeUser;
    const userPreview = res.locals.userPreview;
    let projectPreview = res.locals.projectPreview;


    const postPreview = postServices.createContentPreview(post._id, post.date);
    res.locals.post_id = post._id;
    if (project) project.post_ids.unshift(post._id);
    if (indexUser.preferred_post_privacy !== postPrivacyType) {
        indexUser.preferred_post_privacy = postPrivacyType;
    }

    if (isCompleteProject) {
        projectServices.removeProjectDraft(indexUser.drafts, project._id);
        projectPreview.status = "COMPLETE";
        project.status = "COMPLETE";
    }

    postServices.setRecentPosts(postPreview.content_id, indexUser.recent_posts);
    postServices.updatePostLists(
        postPreview,
        post.pursuit_category,
        user.pursuits,
    );

    postServices.updatePostLists(
        postPreview,
        post.pursuit_category,
        userPreview.pursuits,
    );

    postServices.setPursuitAttributes(
        indexUser.pursuits,
        pursuitCategory,
        minDuration);

    postServices.setPursuitAttributes(
        user.pursuits,
        pursuitCategory,
        minDuration,
        post._id,
        date);

    postServices.setPursuitAttributes(
        userPreview.pursuits,
        pursuitCategory,
        minDuration,
        post._id,
        date);

    postServices.updateLabels(
        user,
        indexUser,
        labels);

    const savedUserPreview = userPreview
        .save()
        .catch(error => {
            if (error) {
                console.log(error);
                res.status(500).json('Error: ' + error);
            }
        });
    const savedIndexUser = indexUser
        .save()
        .catch(error => {
            if (error) {
                console.log(error);
                res.status(500).json('Error: ' + error);
            }
        });
    const savedUser = user.save().catch(error => {
        if (error) {
            console.log(error);
            res.status(500).json('Error: ' + error);
        }
    });
    const savedPost = post.save().catch(error => {
        if (error) {
            console.log(error);
            res.status(500).json('Error: ' + error);
        }
    });

    if (project) {
        const savedProject = project.save().catch(error => {
            if (error) {
                console.log(error);
                res.status(500).json('Error: ' + error);
            }
        });
        const promises = [savedUserPreview, savedIndexUser, savedUser, savedPost, savedProject];
        if (isCompleteProject) promises.push(projectPreview.save());
        console.log(promises);
        return Promise.all(promises)
            .then(() => next());
    }
    else {
        return Promise.all([savedUserPreview, savedIndexUser, savedUser, savedPost])
            .then(() => next());
    }
}

const sendToFollowers = (req, res, next) => {

    let followersIDArray = [];
    for (const user of res.locals.userRelation.followers) {
        followersIDArray.push(user.user_preview_id);
    }
    return findManyByID(ModelConstants.USER_PREVIEW, followersIDArray)
        .then((result) => {
            if (result) {
                let indexUserIDArray = []
                for (const previewedUser of result) {
                    indexUserIDArray.push(previewedUser.parent_index_user_id);
                }
                return findManyByID(ModelConstants.INDEX_USER, indexUserIDArray);
            }
            else {
                throw new Error(500);
            }
        })
        .then(
            (userArray) => {
                const promisedUpdatedFollowerArray = userArray.map(
                    indexUser => new Promise((resolve) => {
                        indexUser.following_feed.unshift(res.locals.post_id);
                        if (indexUser.following_feed.length > 50) {
                            indexUser.following_feed.shift();
                        }
                        indexUser.save().then(() => resolve("saved")).catch(next);
                    })
                );
                return Promise.all(promisedUpdatedFollowerArray)
                    .then((result) => {
                        return res.status(201).send(res.locals.post_id)
                    });
            }
        )
        .catch(next);
}
exports.loadParentThread = loadParentThread;
exports.loadProjectPreview = loadProjectPreview;
exports.loadPostCreation = loadPostCreation;
exports.updateMetaInfo = updateMetaInfo;
exports.sendToFollowers = sendToFollowers;