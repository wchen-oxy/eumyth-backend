const { findByID } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');

const adjustEntryLength = (array, max) => {
    if (array.length > max) {
        array.pop();
        return array;
    }
    else {
        return array;
    }
}

const findAndUpdateIndexUserMeta = (indexUserID, pursuit) => {
    return findByID(ModelConstants.INDEX_USER, indexUserID)
        .then(result => {
            let user = result;
            if (pursuit) {
                for (const pursuit of user.pursuits) {
                    if (pursuit.name === pursuit) {
                        pursuit.num_projects++;
                    }
                }
            }
            else {
                user.pursuits[0].num_projects++;
            }

            return user;
        });
}


exports.adjustEntryLength = adjustEntryLength;
exports.findAndUpdateIndexUserMeta = findAndUpdateIndexUserMeta;
