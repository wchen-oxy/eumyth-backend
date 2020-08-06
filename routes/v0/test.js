var express = require('express');
var router = express.Router();
let Pursuit = require('../models/pursuit.model');
let User = require('../models/user.model');
let IndexUser = require('../models/index.user.model');


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('Test Successful!');
// });

router.get('/', function(req, res){
  const arr = [{name: "Coding"}, {name: "Cycling"}];
  console.log(typeof(arr));

  const user = new IndexUser.Model({
    username: 'fartface',
    uid: '1234',
    private: true,
    pursuitNames: arr,
  })

  // const user = new User.Model({
  //   "uidz": "Test User"
  // })
  user.save().then(() => res.send('Test Finished')).catch(err => res.status(400).json('Error: ' + err));

  const entry = new Pursuit.Model({
    "Coding": "This is the Coding Value",
    description: "This is an activity"
  }
  
  
  );
  
});

module.exports = router;
