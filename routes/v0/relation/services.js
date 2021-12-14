
const selectModel = require('../../../models/modelServices.js')
const ModelConstants = require('../../../models/constants');

const _statusChanger = (action, targetID, array, isPrivate) => {
    const stringID = targetID.toString();
    switch (action) {
        case ("FOLLOW"):
            const state = isPrivate ? "FOLLOW_REQUESTED" : "FOLLOWING";
            array.push(selectModel(ModelConstants.USER_RELATION_STATUS)({
                status: state,
                user_preview_id: targetID,
            }));
        case ("DECLINE"):
            return array.filter(item => item.user_preview_id.toString() !== stringID);
        case ("UNFOLLOW"):
            return array.filter(item => item.user_preview_id.toString() !== stringID);
        case ('ACCEPT'):
            for (let i = 0; i < array.length; i++) {
                if (array[i].user_preview_id.toString() === stringID) {
                    array[i].status = 'FOLLOWING';
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
    targetUserRelation,
    visitorUserRelation,
    action,
    isPrivate) => {
    console.log(action);
    if (action === "FOLLOW" || action === "ACCEPT") {
        _statusChanger(action, targetUserRelation.user_preview_id, visitorUserRelation.following, isPrivate);
        _statusChanger(action, visitorUserRelation.user_preview_id, targetUserRelation.followers, isPrivate);
    }
    else if ("UNFOLLOW" || 'DECLINE') {
        visitorUserRelation.following = _statusChanger(action, targetUserRelation.user_preview_id, visitorUserRelation.following);
        targetUserRelation.followers = _statusChanger(action, visitorUserRelation.user_preview_id, targetUserRelation.followers);
    }
    else {
        throw new Error('invalid action')
    }
}