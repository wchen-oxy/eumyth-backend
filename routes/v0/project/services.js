const { findByID } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');

const findAndUpdateIndexUserMeta = (indexUserID) => {
    return findByID(ModelConstants.INDEX_USER, indexUserID)
        .then(result => {
            let user = result;
            if (pursuit) {
                for (const pursuit of user.pursuits) {
                    if (pursuit.name === newProject.pursuit) {
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



exports.findAndUpdateIndexUserMeta = findAndUpdateIndexUserMeta;
