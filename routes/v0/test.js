const express = require('express');
const router = express.Router();
const selectModel = require('../../models/modelServices');

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(selectModel('COMMENT')({
    parent_post_id: '610ad3711c565d1aa3151c75',
    commenter_user_id: '610ad3711c565d1aa3151c75',
    comment: "Adsf"
  }));
  // return blah.findById('610ae37d1ed3481de9de8349')
  //   .then(res => console.log(res));
  res.send('Test Successful!');
});

module.exports = router;
