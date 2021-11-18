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
                for (const pursuit of user.pursuits) {
                    if (pursuit.name === pursuit) {
                        _numProjectSetter(pursuit.num_projects, updateType);
                    }
                }
            }
            return user;
        })
        .catch(err => {
            console.log(err);
            res.status(500).send(err)
        });
}


exports.adjustEntryLength = adjustEntryLength;
exports.findAndUpdateIndexUserMeta = findAndUpdateIndexUserMeta;
