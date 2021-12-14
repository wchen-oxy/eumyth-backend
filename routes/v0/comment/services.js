const mongoose = require('mongoose');
const {
    findByID,
    findManyByID
} = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const selectModel = require('../../../models/modelServices');

const _getUniqueUserPreview = (replies, commentUserProfileIDArray) => {
    const transformedReplies = replies.map(reply => reply.commenter_user_id.toString());
    return commentUserProfileIDArray = [
        ... new Set(
            commentUserProfileIDArray
                .concat(transformedReplies)
        )];
}

const _splitRootAndTopComments = (rootComments) => {
    let topComment = null;
    let topLikes = 0;
    let commentArray = [];
    let commentUserProfileIDArray = [];
    let transformedRootCommentIDArray = [];
    for (const comment of rootComments) {
        if (comment.likes.length - comment.dislikes.length >
            topLikes && comment.likes !== 0) {
            topComment = comment;
            topLikes = comment.likes.length - comment.dislikes.length;
        }
        commentArray.push(comment);
        commentUserProfileIDArray.push(comment.commenter_user_id.toString());
        transformedRootCommentIDArray.push(mongoose.Types.ObjectId(comment._id))
    }
    return {
        topComment: topComment,
        commentUserProfileIDArray: commentUserProfileIDArray,
        commentArray: commentArray,
        transformedRootCommentIDArray: transformedRootCommentIDArray
    }
};
const _formatCommentData = (comment, userData) => {
    comment.username = userData.username;
    comment.display_photo_key = userData.tiny_cropped_display_photo_key;
    comment.score = comment.likes.length - comment.dislikes.length;
}
const _nestCompleteComments = (rootCommentArray, userProfileHashTable, repliesArray) => {
    if (!repliesArray) {
        for (let comment of rootCommentArray) {
            const userData = userProfileHashTable[comment.commenter_user_id.toString()];
            _formatCommentData(comment, userData);
        }
        return rootCommentArray;
    }

    let nearRootCommentsIndex = 0;
    let allCommentsArray = rootCommentArray.concat(repliesArray);
    allCommentsArray.sort((a, b) => {
        if (a.ancestor_post_ids.length < b.ancestor_post_ids.length) {
            return 1;
        }
        if (a.ancestor_post_ids.length > b.ancestor_post_ids.length) {
            return -1;
        }
        return 0;
    });
    console.log(allCommentsArray);
    for (let i = 0; i < allCommentsArray.length; i++) {
        let nextValueIndex = i + 1;
        let reply = allCommentsArray[i];
        const userData = userProfileHashTable[reply.commenter_user_id.toString()];
        _formatCommentData(reply, userData);
        //get index of comment on root
        if (i > 0 &&
            (allCommentsArray[i].ancestor_post_ids.length !== allCommentsArray[i - 1].ancestor_post_ids.length
            )) {
            nearRootCommentsIndex = i;
        }
        while (
            nextValueIndex < allCommentsArray.length
            && reply.ancestor_post_ids.length > 0
            && reply.ancestor_post_ids[reply.ancestor_post_ids.length - 1].toString() //last in ancestor comment
            !== allCommentsArray[nextValueIndex]._id.toString()) { //next comment id
            nextValueIndex++; //increment until reply finds its parent
        }
        console.log(nextValueIndex);
        if (reply.ancestor_post_ids.length > 0 &&
            nextValueIndex < allCommentsArray.length
            && reply
                .ancestor_post_ids[reply
                    .ancestor_post_ids.length - 1]
                .toString() === allCommentsArray[nextValueIndex]._id.toString()) {
            if (!allCommentsArray[nextValueIndex].replies) {
                console.log('set');
                allCommentsArray[nextValueIndex].replies = [];
            }
            console.log(allCommentsArray[nextValueIndex]);
            allCommentsArray[nextValueIndex].replies.push(reply);
        }
        else {
            console.log("Orphaned/Root Comment: ", reply);
        }
    }
    return (allCommentsArray
        .slice(
            nearRootCommentsIndex,
            allCommentsArray.length));

}

const removeVote = (array, voteID) => {
    let index = array.indexOf(voteID);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

const returnCollapsedComments = (rootCommentIDArray) => {
    let commentArray = null;
    return findByID(ModelConstants.COMMENT, rootCommentIDArray)
        .then((rawComments) => {
            const processedRootComments = _splitRootAndTopComments(rawComments);
            let slicedCommentIDArray = [];
            commentArray = processedRootComments.commentArray;
            topComment = processedRootComments.topComment;

            for (const comment of commentArray.slice(0, 4)) {
                slicedCommentIDArray.push(comment.commenter_user_id.toString());
            }

            return findManyByID(ModelConstants.USER_PREVIEW, slicedCommentIDArray);
        })
        .then((results) => {
            let userProfileHashTable = {}

            results.forEach((value) => (
                userProfileHashTable[value._id.toString()] = value));

            return _nestCompleteComments(
                commentArray,
                userProfileHashTable,
                null
            );
        });
};


const returnExpandedComments = (rootCommentIDArray) => {
    let rootCommentArray = null;
    let commentUserProfileIDArray = null;
    let transformedRootCommentIDArray = null;
    let replies = null;
    return findManyByID(ModelConstants.COMMENT, rootCommentIDArray).lean()
        .then((rawComments) => {
            const processedRootComments =
                _splitRootAndTopComments(rawComments);
            commentUserProfileIDArray =
                processedRootComments.commentUserProfileIDArray;
            rootCommentArray = processedRootComments.commentArray;
            topComment = processedRootComments.topComment;
            transformedRootCommentIDArray =
                processedRootComments.transformedRootCommentIDArray;

            return selectModel(ModelConstants.COMMENT)
                .aggregate([
                    {
                        $match: {
                            "ancestor_post_ids": { $in: transformedRootCommentIDArray },
                        }
                    },
                    {
                        $group: {
                            "_id": "$_id",
                            "parent_post_id": { $first: "$parent_post_id" },
                            "commenter_user_id": { $first: "$commenter_user_id" },
                            "ancestor_post_ids": { $first: "$ancestor_post_ids" },
                            "comment": { $first: "$comment" },
                            "annotation": { $first: "$annotation" },
                            "likes": { $first: "$likes" },
                            "dislikes": { $first: "$dislikes" },
                            "createdAt": { $first: "$createdAt" }
                        }
                    }
                ]);
        })
        .then((results) => {
            let IDList = commentUserProfileIDArray;
            replies = results;
            if (replies.length > 0) {
                IDList = _getUniqueUserPreview(replies, commentUserProfileIDArray);
            }
            return findManyByID(ModelConstants.USER_PREVIEW, IDList);
        })
        .then((results) => {
            let userProfileHashTable = {}
            results.forEach(
                (value) => userProfileHashTable[value._id.toString()] = value
            )
            return _nestCompleteComments(
                rootCommentArray,
                userProfileHashTable,
                replies.length === 0 ? null : replies
            );
        });
}

exports.removeVote = removeVote;
exports.returnCollapsedComments = returnCollapsedComments;
exports.returnExpandedComments = returnExpandedComments;