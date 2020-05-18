var express = require('express');
var router = express.Router();
let User = require('../models/user.model');


/* GET users listing. */
router.get('/login', function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  const user = new User({
    email,
    password,
  });
  
  User.find({email: user.email})
  .then(users => res.json(users))
  .catch(err => res.status(400).json('Error: ' + err));

  // res.send('respond with a resource');
});

router.route('/add').post((req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;

  const newUser = new User({
    email,
    password,
    firstName,
    lastName,
  });
  
  newUser.save().then(() => res.json('User added!'))
  .catch(err => res.status(400).json('Error: ' + err));

  // const matchingUsers = User.find()
  // .then(users => res.json(users))
  // .catch(err => res.status(400).json('Error: ' + err));

  // if (matchingUsers) {
  //   console.log(matchingUsers);
  // }

})

module.exports = router;
