var router = require('express').Router();
let User = require('../../models/user.model');


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
      res.status(200).json(result)
  )
    .catch(err =>
      res.send(err))
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
router.post('/username', (req, res) => {
  const username = req.body.username;
  IndexUser.Model.findOne({ username: username }).then(
    result => {
      if (result) res.status(200).json(result);
      else {
        res.status(400);
      }
    }
  )
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



