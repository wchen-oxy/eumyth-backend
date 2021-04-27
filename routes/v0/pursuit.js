// var router = require('express').Router();
// let User = require('../../models/user.model');
// let IndexUser = require('../../models/index.user.model');
// let { NoContentError } = require("../../utils/errors");
// let { NO_USER_FOUND } = require("../../constants/messages");
// const { validateQueries, doesValidationErrorExist } = require("../../utils/validators");
// const { USERNAME } = require("../../constants/messages");

// router.route('/').get(validateQueries, doesValidationErrorExist, (req, res, next) => {
//   const username = req.query.username;
//   return IndexUser.Model.findOne({ username: username })
//     .then(user => {
//       if (!user) throw new NoContentError(NO_USER_FOUND);
//       return User.Model.findOne({ uid: user.uid });
//     })
//     .then(result => {
//       if (!result) throw new NoContentError(NO_USER_FOUND);
//       return res.status(200).json(result.pursuits)
//     })
//     .catch(next);
// });

// module.exports = router;

