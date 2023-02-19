
const selectModel = require('../../../models/modelServices.js')
const ModelConstants = require('../../../models/constants');

const _statusChanger = (action, userRelation, members, cachedFeedID, isPrivate) => {
    const indexUserID = userRelation.parent_index_user_id;
    const userPreviewID = userRelation.user_preview_id;
    const stringID = userPreviewID.toString()
    switch (action) {
        case ("FOLLOW"):
            const state = isPrivate ? "FOLLOW_REQUESTED" : "FOLLOWING";
            members.push(selectModel(ModelConstants.USER_RELATION_STATUS)({
                status: state,
                parent_index_user_id: indexUserID,
                user_preview_id: userPreviewID,
                cached_feed_id: cachedFeedID
            }));

        case ("DECLINE"):
            return members.filter(item => item.user_preview_id.toString() !== stringID);
        case ("UNFOLLOW"):
            return members.filter(item => item.user_preview_id.toString() !== stringID);
        case ('ACCEPT'):
            for (let i = 0; i < array.length; i++) {
                if (members[i].user_preview_id.toString() === stringID) {
                    members[i].status = 'FOLLOWING';
                    // console.log(array[i])
                    return null;
                }
            }
            break;
        default:
            throw new Error("No action type matched for follow response");

    }
}
exports.setAction = (
    target,
    visitor,
    cachedIDs,
    action,
    isPrivate) => {
    console.log(action);
    if (action === "FOLLOW" || action === "ACCEPT") {
        _statusChanger(
            action,
            target,
            visitor.following,
            cachedIDs.target,
            isPrivate
        );
        _statusChanger(
            action,
            visitor,
            target.followers,
            cachedIDs.visitor,
            isPrivate
        );
    }
    else if ("UNFOLLOW" || 'DECLINE') {
        visitor.following = _statusChanger(
            action,
            target,
            visitor.following,
            cachedIDs.target
        );

        target.followers = _statusChanger(
            action,
            visitor,
            target.followers,
            cachedIDs.visitor
        );
    }
    else {
        throw new Error('invalid action')
    }
}