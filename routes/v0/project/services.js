const { findByID } = require('../../../data-access/dal');
const ModelConstants = require('../../../models/constants');
const { EMBEDDED_FEED_LIMIT } = require('../../../shared/constants/settings');
const selectModel = require('../../../models/modelServices');

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

const retrieveProjects = (model) => {
    selectModel(ModelConstants.PROJECT)
        .aggregate(
            [
                {
                    "$project": {
                        length: { $size: { $gt: 2 } }
                    }
                },
                { "$sort": { "length": -1 } },
            ],
            (err, res) => {
                if (err) console.log(err);
                else {
                    console.log(results);
                }
            }
        )
}

const updateParentProject = (oldProject, newProjectID) => {

    oldProject.children.push(newProjectID);
    oldProject.children_length = oldProject.children_length + 1;
    return oldProject;

}

const partialDelete = (project) => {
    project.username = undefined;
    project.index_user_id = undefined;
    project.display_photo_key = undefined;
    project.title = undefined;
    project.subtitle = undefined;
    project.pursuit = undefined;
    project.overview = undefined;
    project.cover_photo_key = undefined;
    project.start_date = undefined;
    project.end_date = undefined;
    project.min_duration = undefined;
    project.post_ids = undefined;
    project.labels = undefined;
    project.status = 'DELETED';
    return project;
}
exports.partialDelete = partialDelete;
exports.adjustEntryLength = adjustEntryLength;
exports.findAndUpdateIndexUserMeta = findAndUpdateIndexUserMeta;
exports.updatePursuitObject = updatePursuitObject;
exports.updateParentProject = updateParentProject;