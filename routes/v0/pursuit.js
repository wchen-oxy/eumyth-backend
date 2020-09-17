var router = require('express').Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');

router.route('/').get((req, res) => {
  const username = req.query.username;
  console.log(username);
  return IndexUser.Model.findOne({ username: username })
    .then(
      user => {
        console.log(user.uid);
        return User.Model.findOne({ uid: user.uid });
      }
    )
    .then(
      result => res.json(result.pursuits)
    )
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;

