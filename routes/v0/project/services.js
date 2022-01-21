const { findByID } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const { EMBEDDED_FEED_LIMIT } = require('../../../shared/constants/settings');


const adjustEntryLength = (array, max) => {
    if (array.length > max) {
        array.pop();
        return array;
    }
    else {
        return array;
    }
}

const findAndUpdateIndexUserMeta = (indexUserID, pursuit, updateType) => {
    const _numProjectSetter = (count, updateType) => {
        if (updateType === "ADD") {
            count++;
        }
        else if (updateType === "SUBTRACT") {
            count--;
        }
    }

    return findByID(ModelConstants.INDEX_USER, indexUserID)
        .then(result => {
            let user = result;
            _numProjectSetter(user.pursuits[0].num_projects, updateType);
            if (pursuit) {
                for (const pursuitMeta of user.pursuits) {
                    if (pursuitMeta.name === pursuit) {
                        _numProjectSetter(pursuitMeta.num_projects, updateType);
                    }
                }
            }
            return user;
        });
}

const updatePursuitObject = (model, modelID, contentID) =>
    findByID(model, modelID)
        .then((result => {
            let user = result;
            const newContent = selectModel(ModelConstants.CONTENT_PREVIEW)({ content_id: contentID });
            user.pursuits[0].projects.unshift(newContent);
            adjustEntryLength(user.pursuits[0].projects, EMBEDDED_FEED_LIMIT)
            for (const pursuit of user.pursuits) {
                if (pursuit.name === newProject.pursuit) {
                    pursuit.projects.unshift(newContent);
                }
            }
            return user;
        }));


exports.adjustEntryLength = adjustEntryLength;
exports.findAndUpdateIndexUserMeta = findAndUpdateIndexUserMeta;
exports.updatePursuitObject = updatePursuitObject;
