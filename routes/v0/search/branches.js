const { find } = require("../../../data-access/dal");
const ModelConstants = require('../../../models/constants');
const { searchProjectData, _sortByDate } = require("./services");

module.exports = (req, res, next) => {
    const pursuitArray = req.query.pursuitArray;
    const indexUserID = req.query.indexUserID;
    const userPreviewIDLIst = req.query.userPreviewIDLIst;
    const usedProjectPreviewIDList = req.query.projectPreviewIDList;
    const requestQuantity = parseInt(req.query.requestQuantity);

    return searchProjectData(
        ModelConstants.PROJECT_PREVIEW_WITH_ID,
        pursuitArray,
        usedProjectPreviewIDList,
        requestQuantity,
        indexUserID,
        true
    )
        .then(
            results => {
                const sortedResults = results.sort(_sortByDate);
                return res.status(200).json({ projectPreviews: sortedResults })
            }
        );

} 