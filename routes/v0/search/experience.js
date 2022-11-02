module.exports = (req, res, next) => {
    //hardcode 10000 miles in for now for a limit
    const names = res.locals.names;
    const users = res.locals.users;
    const beginner = [];
    const familiar = [];
    const experienced = [];
    const expert = [];

    for (const user of users) {
        for (let i = 1; i < user.pursuits.length; i++) {
            if (names.includes(user.pursuits[i])) {
                switch (pursuits[i].experience_level) {
                    case (BEGINNER):
                        if (beginner.length)
                        beginner.push(user);
                        break;
                    case (FAMILIAR):
                        familiar.push(user);
                        break;
                    case (EXPERIENCED):
                        experienced.push(user);
                        break;
                    case (EXPERT):
                        expert.push(user);
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