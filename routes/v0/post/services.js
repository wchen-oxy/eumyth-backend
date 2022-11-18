const Comment = require("../../../models/comment.model");
const mongoose = require("mongoose");
const selectModel = require('../../../models/modelServices');
const {
    findOne,
    findByID,
    findManyByID,
} = require('../../../data-access/dal');

const { ALL } = require("../../../shared/utils/flags");
const ModelConstants = require('../../../models/constants');
const RECENT_POSTS_LIMIT = 5;


const _insertAndSortIntoList = (postList, postPreview) => {
    postList.unshift(postPreview);
    if (postList.length > 1) {
        postList.sort((a, b) => {
            if (!b.date && !a.date) {
                b.createdAt - a.createdAt;
            }
            else if (!b.date) {
                postList.sort((a, b) => b.createdAt - a.date);
            }
            else if (!a.date) {
                postList.sort((a, b) => b.date - a.createdAt);
            }
            else {
                postList.sort((a, b) => b.date - a.date);
            }
        });
    }
    return postList;
}

const updatePostLists = (post, pursuitCategory, pursuits) => {
    _insertAndSortIntoList(pursuits[0].posts, post);
    for (let i = 1; i < pursuits.length; i++) {
        if (pursuitCategory === pursuits[i].name) {
            _insertAndSortIntoList(pursuits[i].posts, post);
        }
    }
}


const setRecentPosts = (post, inputRecentPosts) => {
    inputRecentPosts.unshift(post);
    if (inputRecentPosts.length > RECENT_POSTS_LIMIT) {
        inputRecentPosts.pop();
    }
}

const updateDeletedPostMeta = (
    pursuit,
    minDuration,
    isIndexUser
) => {
    if (minDuration) { pursuit.total_min -= pursuit.minDuration; }
    if (isIndexUser) { pursuit.num_posts -= 1; }

}

const createContentPreview = (postID, date, labels, branch) => (
    selectModel(
        ModelConstants.CONTENT_PREVIEW)
        ({
            content_id: postID,
            date: date,
            labels: labels,
            branch: branch,
        })
);

const setPursuitAttributes = (
    isIndexUser,
    pursuits,
    pursuitCategory,
    minDuration) => {
    for (const pursuit of pursuits) {
        if (pursuit.name === ALL) {
            if (isIndexUser) {
                pursuit.num_posts = Number(pursuit.num_posts) + 1;
            }
            if (minDuration) {
                pursuit.total_min = Number(pursuit.total_min) + minDuration;
            }
        }
        else if (pursuit.name === pursuitCategory) {

            if (minDuration) {
                pursuit.total_min = Number(pursuit.total_min) + minDuration;
            }
        }
    }
}

const getImageUrls = (array) => {
    let imageArray = [];
    for (const imageFile of array) {
        imageArray.push(imageFile.key);
    }
    return imageArray;
}

const makeTextSnippet = (isPaginated, textData) => {
    if (isPaginated) {
        return (textData[0].length > 140
            ? (textData[0].substring(0, 140).trim()) + "..."
            : textData[0]);
    }
    else {
        return (textData.length > 140
            ? textData.substring(0, 140).trim() + "..."
            : textData);
    }

}

const findPosts = (postIDList, includePostText) => {
    return findManyByID(ModelConstants.POST, postIDList, true)
        .then(
            (results) => {
                let coverInfoArray = results;
                if (!includePostText) {
                    for (result of coverInfoArray) {
                        result.text_data = "";
                        result.feedback = "";
                    }
                }
                return coverInfoArray;
            })
}

const countComments = (postIDList) => {
    let transformedPostIDArray = postIDList.map(postID => mongoose.Types.ObjectId(postID));

    return Comment.Model.aggregate([
        {
            $match: {
                "parent_post_id": { $in: transformedPostIDArray },
            }
        },
        {
            $group: {
                "_id": "$parent_post_id",
                "comment_count": { $sum: 1 },
            }
        },
        {
            $group: {
                "_id": "",
                "data": {
                    $mergeObjects: {
                        $arrayToObject: [[{ k: { $toString: "$_id" }, v: "$comment_count" }]]
                    }
                }
            }
        },
        {
            $replaceRoot: { newRoot: "$data" }
        }

    ])
}

const retrieveRelevantUserInfo = (req, res, next) => {
    return findByID(ModelConstants.USER_PREVIEW, req.body.userPreviewID)
        .then((resolvedUserPrevew) => {
            res.locals.userPreview = resolvedUserPrevew;
            return findByID(ModelConstants.INDEX_USER, resolvedUserPrevew.parent_index_user_id);
        })
        .then((result) => {
            res.locals.indexUser = result;
            return Promise.all([
                findByID(ModelConstants.USER, res.locals.indexUser.user_profile_id),
                findByID(ModelConstants.USER_RELATION, res.locals.indexUser.user_relation_id)
            ])
        }
        )
        .then((results) => {
            res.locals.completeUser = results[0];
            res.locals.userRelation = results[1];
            next();
        })
        .catch(next);
};

const createPost = (
    username,
    title,
    postPrivacyType,
    date,
    authorID,
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
    projectpreviewID) => {
    return selectModel(
        ModelConstants.POST)
        (
            {
                username: username,
                title: title,
                post_privacy_type: postPrivacyType,
                date: date,
                author_id: authorID,
                pursuit_category: pursuitCategory,
                display_photo_key: displayPhoto,
                cover_photo_key: coverPhotoKey,
                is_paginated: isPaginated,
                image_data: imageData,
                text_snippet: textSnippet,
                text_data: textData,
                min_duration: minDuration,
                difficulty: difficulty,
                labels: labels,
                project_preview_id: projectpreviewID
            }
        );
}

const updateLabels = (completeUser, indexUser, labels) => {
    if (indexUser.labels.length === 0) {
        indexUser.labels = labels;
        completeUser.labels = labels;
    }
    else {
        let parsedCurrentLabels = indexUser.labels;
        parsedCurrentLabels.push(...labels);
        indexUser.labels = [...new Set(parsedCurrentLabels)];
        completeUser.labels = [...new Set(parsedCurrentLabels)];
    }
}

const spliceArray = (postID, array) => {
    let index = null;
    for (let i = 0; i < array.length; i++) {
        if (array[i].toString() === postID) {
            index = i;
            break;
        }
    }
    array.splice(index, 1);
}



exports.updatePostLists = updatePostLists;
exports.setRecentPosts = setRecentPosts;
exports.updateDeletedPostMeta = updateDeletedPostMeta;
exports.createContentPreview = createContentPreview;
exports.setPursuitAttributes = setPursuitAttributes;
exports.getImageUrls = getImageUrls;
exports.makeTextSnippet = makeTextSnippet;
exports.findPosts = findPosts;
exports.countComments = countComments;
exports.retrieveRelevantUserInfo = retrieveRelevantUserInfo;
exports.createPost = createPost;
exports.updateLabels = updateLabels;
exports.spliceArray = spliceArray;