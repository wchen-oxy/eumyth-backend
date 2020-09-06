var router = require('express').Router();
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');



// router.route('/').get((req, res) => {
//   User.find()
//     .then(users => res.json(users))
//     .catch(err => res.status(400).json('Error: ' + err));
// });

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

// router.post('/available', (req, res) => {
//   const username = req.body.username;
//   console.log(req.body);
//   IndexUser.Model.findOne({ username: username }).then(
//     result => {
//       console.log(result);
//       if (result) {
//         console.log("true");
//         res.json(true);
//       }
//       else {
//         res.json(false);
//       }
//     }
//   )
//     .catch(
//       err => {
//         console.log(err);
//         res.send(err);
//       }
//     )
// }
// )

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

// router.route('/add').post((req, res) => {
//   const username = req.body.username;
//   const newUser = new User.Model({username});
//   newUser.save()
//     .then(() => res.json('User added!'))
//     .catch(err => res.status(400).json('Error: ' + err));
// });

module.exports = router;




// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;



