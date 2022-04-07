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

const findAndUpdateIndexUserMeta = (updateType, indexUserID, pursuit, draftObject) => {
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
            user.drafts.unshift(
                selectModel(ModelConstants.DRAFT_PREVIEW)
                    ({
                        title: draftObject.title,
                        content_id: draftObject.content_id
                    }));
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

const updatePursuitObject = (model, modelID, contentID, pursuit) =>
    findByID(model, modelID)
        .then((result => {
            let user = result;
            const newContent = selectModel(ModelConstants.CONTENT_PREVIEW)({ content_id: contentID });
            user.pursuits[0].projects.unshift(newContent);
            adjustEntryLength(user.pursuits[0].projects, EMBEDDED_FEED_LIMIT)
            for (const pursuit of user.pursuits) {
                if (pursuit.name === pursuit) {
                    pursuit.projects.unshift(newContent);
                }
            }
            return user;
        }));

const retrieveSpotlightProjects = (limit) => {
    return selectModel(ModelConstants.PROJECT)
        .find(
            {
                // children_length: { $gt:  },
                status: { $ne: 'DELETED' }
            },
        )
        .limit(limit);
    // .aggregate(
    //     [
    //         {
    //             "$project": {
    //                 children_length: { $gt: 2 }
    //             }
    //         },
    //         { "$sort": { "length": -1 } },
    //     ],
    //     (err, res) => {
    //         if (err) console.log(err);
    //         else {
    //             console.log(results);
    //         }
    //     }
    // )
}

const removeProjectDraft = (drafts, ID) => {
    console.log(drafts);
    console.log(ID);
    const condition = (element) => ID.toString() === element.content_id.toString();
    const index = drafts.findIndex(condition);
    if (index === -1) {
        throw new Error("draft not found");
    }
    else {
        return drafts.splice(index, 1);
    }
}

const updateParentProject = (oldProject, newProjectID, title, remix) => {
    oldProject.children.push(selectModel(ModelConstants.PROJECT_PREVIEW_NO_ID)({
        project_id: newProjectID,
        title,
        remix
    }));
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

const removeVote = (array, voteID) => {
    let index = array.indexOf(voteID);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
}

exports.partialDelete = partialDelete;
exports.adjustEntryLength = adjustEntryLength;
exports.findAndUpdateIndexUserMeta = findAndUpdateIndexUserMeta;
exports.updatePursuitObject = updatePursuitObject;
exports.updateParentProject = updateParentProject;
exports.retrieveSpotlightProjects = retrieveSpotlightProjects;
exports.removeVote = removeVote;
exports.removeProjectDraft = removeProjectDraft;