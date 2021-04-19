var router = require('express').Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');
let { BadRequestError } = require("../../utils/errors");

router.route('/').get((req, res, next) => {
  const username = req.query.username;
  return IndexUser.Model.findOne({ username: username })
    .then(user => User.Model.findOne({ uid: user.uid }))
    .then(result => res.json(result.pursuits))
    .catch((error) => next(new BadRequestError(error)));
});

module.exports = router;

