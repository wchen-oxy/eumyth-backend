const { BEGINNER, FAMILIAR, EXPERIENCED, EXPERT } = require("../../../shared/utils/flags");


module.exports = (req, res, next) => {
    //hardcode 10000 miles in for now for a limit
    const names = req.query.pursuit;
    const users = res.locals.users;
    const beginner = [];
    const familiar = [];
    const experienced = [];
    const expert = [];

    for (const user of users) {
        // console.log(user);
        for (let i = 1; i < user.pursuits.length; i++) {
            console.log(names.includes(user.pursuits[i].name));
            if (names.includes(user.pursuits[i].name)) {
                const data = {
                    parent_index_user_id: user.parent_index_user_id,
                    parent_user_id: user.parent_user_id,
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    distance: user.distance,
                    small_cropped_display_photo_key: user.small_cropped_display_photo_key,
                    tiny_cropped_display_photo_key: user.tiny_cropped_display_photo_key,
                    pursuit: user.pursuits[i]
                };
                switch (user.pursuits[i].experience_level) {
                    case (BEGINNER):
                        beginner.push(data);
                        break;
                    case (FAMILIAR):
                        familiar.push(data);
                        break;
                    case (EXPERIENCED):
                        experienced.push(data);
                        break;
                    case (EXPERT):
                        expert.push(data);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    res.locals.beginner = beginner;
    res.locals.familiar = familiar;
    res.locals.experienced = experienced;
    res.locals.expert = expert;
    next();
}