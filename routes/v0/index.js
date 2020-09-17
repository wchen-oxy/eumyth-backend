var router = require('express').Router();
let IndexUser = require('../../models/index.user.model');

// Get Basic Info for User
router.get('/', (req, res) => {
  const username = req.query.username;
  IndexUser.Model.findOne({ username: username }).then(
    result =>
      {
        console.log(result);
        res.status(200).json(result);}
  )
    .catch(err =>
      res.status(400).json(err))
})

router.get('/pursuits', (req, res) => {
  const username = req.query.username;
  IndexUser.Model.findOne({ username: username }).then(
    result =>
      res.status(200).json(result.pursuits)
  )
    .catch(err =>
      res.status(400).json(err))
})

//check if username is available
router.get('/username', (req, res) => {
  console.log("username");
  const username = req.query.username;
  console.log(username);
  IndexUser.Model.findOne({ username: username }).then(
    result => {
    console.log(result);
    if (result) res.status(200).json("Is Taken");
    else{
      res.status(204).json("Username not Found. Is not taken!");

    }
  }
  ).catch((err) => {
    console.log("Error: " + err);
    res.status(500).json("Error: " + err);
  })
})

module.exports = router;
