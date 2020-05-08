var express = require('express');
var router = express.Router();
let User = require('../models/user.model');


router.route('/').get((req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    const user = new User({
      email,
      password,
    });
    
    User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));

    // const matchingUsers = User.find()
    // .then(users => res.json(users))
    // .catch(err => res.status(400).json('Error: ' + err));
  
    // if (matchingUsers) {
    //   console.log(matchingUsers);
    // }
  
  })
  
  module.exports = router;
  