const { ALL, BEGINNER, FAMILIAR, EXPERIENCED, EXPERT } = require("../../../shared/utils/flags");

const _filterAll = (pursuit) => { if (pursuit.name !== ALL) return true; else { return false } };

module.exports = (req, res, next) => {
    const pursuits = res.locals.pursuits;
    let formatted = {};
    for (const pursuit of pursuits) {
        const exact = [];
        const different = [];
        const type = pursuit.name;
        // console.log(pursuit.exact);
        for (const user of pursuit.exact) {
            exact.push(user);
        }
        for (const user of pursuit.different) {
            different.push(user);
        }
        formatted[type] = { exact, different };
    }
    res.locals.formatted = formatted;
    next();
}