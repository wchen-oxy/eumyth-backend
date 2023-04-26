const { findByID, findManyByID, findOne, find } = require('../../../data-access/dal');
const postServices = require('./services');
const projectServices = require('../project/services');
const selectModel = require('../../../models/modelServices');
const { checkStringBoolean, verifyArray } = require("../../../shared/helper");
const ModelConstants = require('../../../models/constants');
const { CHILDREN, FOLLOWERS, PARENT, SIBLINGS } = require('../../../shared/utils/flags');
const { CACHED_FEED_LIMIT } = require("../../../shared/constants/settings");

const _getAncestorProjectID = (project) => {
    if (project && project.remix) {
        const index = project.ancestors.length - 1;
        return project.ancestors[index].parent_project_id;
    }
    else {
        return null;
    }
}
const _saveOwnerPostInfo = (
    userPreview,
    indexUser,
    user,
    post,
    newProject,
    newProjectPreview,
    isCompleteProject
) => {

    const savedUserPreview = _saveModel(userPreview);
    const savedIndexUser = _saveModel(indexUser);
    const savedUser = _saveModel(user);
    const savedPost = _saveModel(post);

    if (newProject) {
        const savedProject = _saveModel(newProject);
        const promises = [
            savedUserPreview,
            savedIndexUser,
            savedUser,
            savedPost,
            savedProject
        ];
        if (isCompleteProject) promises.push(newProjectPreview.save());
        return Promise.all(promises);
    }
    else {
        return Promise.all([
            savedUserPreview,
            savedIndexUser,
            savedUser,
            savedPost
        ]);
    }
}

const _feedOrdering = (feed, postID) => {
    feed.unshift(postID);
    if (feed.length > CACHED_FEED_LIMIT) {
        feed.shift();
    }
}

const _feedDecider = (type, map, postID, feedArray) => {
    if (feedArray === null || feedArray.length === 0) return [];
    //single parent that owns your project
    switch (type) {
        case (PARENT):
            feedArray =
                [feedArray].map(feed => {

                    _feedOrdering(map[feed._id].children, postID);
                    return feed;
                });
            break;
        case (CHILDREN):
            console.log("parent", feedArray);
            feedArray =
                feedArray.map(feed => {
                    _feedOrdering(map[feed._id].parents, postID)
                    return feed;
                });
            break;
        case (SIBLINGS):
            console.log("siblings", feedArray);

            feedArray =
                feedArray.map(feed => {
                    _feedOrdering(map[feed._id].siblings, postID);
                    return feed;
                });
            break;
        case (FOLLOWERS): //these are list of feedIDS of people who are following the user in their feeds
            console.log("followers", feedArray);

            feedArray =
                feedArray.map(feed => {
                    _feedOrdering(map[feed._id].following, postID);
                    return feed;
                });
            break;
        default:
            throw new Error("Nothing Matched");
    }
    return feedArray;
}

const _getCachedFeedID = (users, indexUserID) => {
    const results = [];
    for (const user of users) {
        if (user.index_user_id !== indexUserID) results.push(user.cached_feed_id);
    }
    return results;
}

const _saveModel = (model) => {
    return model.save().catch(error => {
        if (error) {
            console.log(error);
            res.status(500).json('Error: ' + error);
        }
    });
}

const _feedFormatter =
    (resolve) => {
        indexUser.following_feed.unshift(res.locals.postID);
        if (indexUser.following_feed.length > 50) {
            indexUser.following_feed.shift();
        }
        indexUser.save().then(() => resolve("saved")).catch(next);
    }


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
            })
            .catch(next);
    }
    return next();
}

const loadPostCreation = (req, res, next) => {
    const username = req.body.username;
    const postPrivacyType = req.body.postPrivacyType;
    const pursuitCategory = req.body.pursuit ? req.body.pursuit.toUpperCase() : res.locals.project.pursuit.toUpperCase();
    const isPaginated = checkStringBoolean(req.body.isPaginated);
    const displayPhoto = req.body.displayPhoto ? req.body.displayPhoto : null;
    const difficulty = req.body.difficulty ? req.body.difficulty : 0;
    const title = req.body.title ? req.body.title : null;
    const labels = req.body.labels ? verifyArray(req.body.labels) : [];
    const date = req.body.date ? new Date(req.body.date) : null;
    const textData = req.body.textData ? req.body.textData : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const coverPhotoKey = req.files && req.files.coverPhoto ? req.files.coverPhoto[0].key : null;
    const imageData = req.files && req.files.images ? postServices.getImageUrls(req.files.images) : [];
    const textSnippet = textData ? postServices.makeTextSnippet(isPaginated, textData) : null;
    const indexUser = res.locals.indexUser;
    const project = res.locals.project;

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
    let post = res.locals.post;
    let project = res.locals.project;
    let projectPreview = res.locals.projectPreview;
    const postPrivacyType = req.body.postPrivacyType;
    const pursuitCategory = req.body.pursuit ? req.body.pursuit : res.locals.project.pursuit;
    const labels = req.body.labels ? verifyArray(req.body.labels) : [];
    const date = req.body.date ? new Date(req.body.date) : null;
    const minDuration = !!req.body.minDuration ? parseInt(req.body.minDuration) : null;
    const indexUser = res.locals.indexUser;
    const isCompleteProject = req.body.completeProject ? checkStringBoolean(req.body.completeProject) : false;
    const user = res.locals.completeUser;
    const userPreview = res.locals.userPreview;
    const postPreview = postServices.createContentPreview(post._id, post.date);

    res.locals.postID = post._id;

    if (project) project.post_ids.unshift(post._id);
    if (indexUser.preferred_post_privacy !== postPrivacyType) {
        indexUser.preferred_post_privacy = postPrivacyType;
    }

    if (isCompleteProject) {
        projectServices.removeProjectDraft(indexUser.drafts, project._id);
        projectPreview.status = "COMPLETE";
        project.status = "COMPLETE";
    }
    postServices.setRecentPosts(
        selectModel(ModelConstants.INDEX_RECENT)({
            content_id: postPreview.content_id,
            project_preview_id: project.project_preview_id
        }),
        indexUser.recent_posts);

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

    const savedUpdates = _saveOwnerPostInfo(
        userPreview,
        indexUser,
        user,
        post,
        project,
        projectPreview,
        isCompleteProject
    );

    return savedUpdates.then(() => next()).catch(next);
    // const savedUserPreview = _saveModel(userPreview);
    // const savedIndexUser = _saveModel(indexUser);
    // const savedUser = _saveModel(user);
    // const savedPost = _saveModel(post);

    // if (project) {
    //     const savedProject = _saveModel(project);
    //     const promises = [savedUserPreview, savedIndexUser, savedUser, savedPost, savedProject];
    //     if (isCompleteProject) promises.push(projectPreview.save());
    //     return Promise.all(promises)
    //         .then(() => next());
    // }
    // else {
    //     return Promise.all([savedUserPreview, savedIndexUser, savedUser, savedPost])
    //         .then(() => next());
    // }
}

const findRecievers = (req, res, next) => {
    const indexUserID = res.locals.indexUser._id;
    const ancestorProjectID = res.locals.project?.parent_project_id ?? null;
    const promisedProjectPreview = //the actual ancestor
        findOne(ModelConstants.PROJECT_PREVIEW_WITH_ID,
            { project_id: ancestorProjectID }
        );
    const promisedProjectPreviews = //people who share first ancestor
        find(
            ModelConstants.PROJECT_PREVIEW_WITH_ID,
            {
                parent_project_id: { $exists: true, $eq: ancestorProjectID },
                project_id: { $ne: res.locals.project._id }
            }
        );

    return Promise
        .all([
            promisedProjectPreview,
            promisedProjectPreviews
        ])
        .then(
            results => {
                res.locals.parentFeedID =
                    results[0] ?
                        results[0].cached_feed_id : null; //first ancestor
                res.locals.siblingsFeedID =
                    results[1].length > 0
                        ? _getCachedFeedID(results[1], indexUserID) : []; //shared ancestor
                res.locals.childrenFeedID =
                    _getCachedFeedID(res.locals.project.children, indexUserID); //people who pulled from you
                res.locals.followersFeedID =
                    _getCachedFeedID(res.locals.userRelation.followers, indexUserID); //people following
                console.log(res.locals.project.children, indexUserID);
                next();
            }
        )
        .catch(next);
}

const sendToRecievers = (req, res, next) => {
    const postID = res.locals.postID;
    const promisedParentFeed = findByID(ModelConstants.FEED, res.locals.parentFeedID);
    const promisedSiblingsFeeds = findManyByID(ModelConstants.FEED, res.locals.siblingsFeedID);
    const promisedChildrenFeeds = findManyByID(ModelConstants.FEED, res.locals.childrenFeedID);
    const promisedFollowersFeeds = findManyByID(ModelConstants.FEED, res.locals.followersFeedID);

    return Promise
        .all([
            promisedParentFeed,
            promisedSiblingsFeeds,
            promisedChildrenFeeds,
            promisedFollowersFeeds
        ])
        .then(
            results => {
                let map = {};
                if (results[0]) { map[results[0]._id] = results[0]; }
                for (let i = 1; i < results.length; i++) {
                    results[i].forEach(
                        (feed) => {
                            if (!map[feed._id]) map[feed._id] = feed;
                        }
                    )
                }

                _feedDecider(PARENT, map, postID, results[0]);
                _feedDecider(SIBLINGS, map, postID, results[1]);
                _feedDecider(CHILDREN, map, postID, results[2]);
                _feedDecider(FOLLOWERS, map, postID, results[3]);


                //because a single entry can belong in multiple feed deciders, you are 
                //inefficiently saving an item potentially 4 times
                const toBeSaved = [];
                for (const cachedFeedID in map) {
                    toBeSaved.push(map[cachedFeedID]);
                }
                // const allFeeds = 

                // updatedFeeds[0]
                //     .concat(
                //         updatedFeeds[1],
                //         updatedFeeds[2],
                //         updatedFeeds[3]
                //     );
                const savedFeeds = toBeSaved.map(
                    feed => new Promise(
                        (resolve) => {
                            feed.save().then(() => resolve("saved")).catch(next)
                        }
                    )
                )
                return Promise.all(savedFeeds);
            }
        )
        .then(
            (result) => {
                return res.status(201).send(res.locals.postID);
            })
        .catch(next);

    // const promisedUpdatedFollowerArray = res.locals.followers.map(
    //     indexUser => new Promise(_feedFormatter)
    // );

    // return Promise.all(promisedUpdatedFollowerArray)
    //     .then((result) => {
    //         return res.status(201).send(res.locals.postID)
    //     });
}

exports.loadParentThread = loadParentThread;
exports.loadProjectPreview = loadProjectPreview;
exports.loadPostCreation = loadPostCreation;
exports.updateMetaInfo = updateMetaInfo;
exports.findRecievers = findRecievers;
exports.sendToRecievers = sendToRecievers;