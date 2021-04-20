var router = require('express').Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');
let { NoContentError } = require("../../utils/errors");
let { NO_USER_FOUND } = require("../../utils/constants");
let { validateUsername } = require("../../utils/helper");


router.route('/').get((req, res, next) => {
  const username = validateUsername(req.query.username);
  return IndexUser.Model.findOne({ username: username })
    .then(user => {
      if (!user) throw new NoContentError(NO_USER_FOUND);
      return User.Model.findOne({ uid: user.uid });
    })
    .then(result => {
      if (!result) throw new NoContentError(NO_USER_FOUND);
      return res.status(200).json(result.pursuits)
    })
    .catch(next);
});

module.exports = router;

