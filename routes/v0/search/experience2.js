const { ALL } = require("../../../shared/utils/flags");

module.exports = (req, res, next) => {
    const pursuits = res.locals.pursuits;
    let formatted = [];
    for (const pursuit of pursuits) {
        const exact = [];
        const different = [];
        const type = pursuit.name;
        for (const user of pursuit.exact) {
            exact.push(user);
        }
        for (let user of pursuit.different) {
            for (let obj of user.pursuits) {
                const post = obj.posts.length > 0 ? [obj.posts[0]] : [];
                const project = obj.projects.length > 0 ? [obj.projects[0]] : [];
                obj.posts = post;
                obj.projects = project;
                console.log(obj);
            }
            different.push(user);
        }
        formatted.push({ type, exact, different });
    }
    res.locals.formatted = formatted;
    next();
}