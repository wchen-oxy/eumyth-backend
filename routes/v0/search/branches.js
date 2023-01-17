const { find } = require("../../../data-access/dal");
const ModelConstants = require('../../../models/constants');
const { searchProjectData, _sortByDate, searchBranchData } = require("./services");

module.exports = (req, res, next) => {
    const indexUserID = req.query.indexUserID;
    const requestQuantity = parseInt(req.query.requestQuantity);
    return searchBranchData(
        ModelConstants.PROJECT_PREVIEW_WITH_ID,
        indexUserID,
        requestQuantity,
    )
        .then(results => {
            const sortedResults = results.sort(_sortByDate);
            return res.status(200).json({ projectPreviews: sortedResults })
        });

}  