var router = require('express').Router();
let Pursuit = require('../../models/pursuit.model');
let User = require('../../models/user.model');
let IndexUser = require('../../models/index.user.model');


// router.route('/'.get((req, res) => {
//   const uid = req.body.uid;
//   User.Model.findOne({uid: uid})
//   .then(
//     user => 
//     res.json(user.pursuits)
//     )

//   .catch(err => res.status(400).json('Error: ' + err));
// });

router.route('/').get((req, res) => {
  const username = req.query.username;
  console.log(username);
  return IndexUser.Model.findOne({ username: username })
    .then(
      user => {
        console.log(user.uid);
        return User.Model.findOne({ uid: user.uid });
        // res.json(User.Model.findOne({uid: user.uid})
        // .then(
        //   user => user.pursuits
        //   ))
      }
    )
    .then(
      result => res.json(result.pursuits)
    )
    .catch(err => res.status(400).json('Error: ' + err));

  //   return User.Model.findOne({uid: uid})
  //     .then(
  //       user => {
  //         console.log(user);
  //         res.json(user.pursuits);
  //       }
  //       )
  //     .catch(err => res.status(400).json('Error: ' + err));
});

// router.route('/title').post((req, res) => {
//     const uid = req.body.uid;
//     console.log(uid);
//     User.Model.findOne({uid: uid})
//       .then(
//         user => res.json(user.pursuits)
//         )
//       .catch(err => res.status(400).json('Error: ' + err));
//   });

// router.route('/').post((req, res) => {
//   const pursuitsArray = req.body.pursuits;
//   const uid = req.body.uid;
//   let updatedPursuits = [];
//   for (const pursuit of pursuitsArray) {
//     const entry = new Pursuit.Model({
//       name: pursuit
//     });
//     updatedPursuits.push(entry);
//   }

//   //create one, there isnt one rn
//   const newUser = new User.Model({
//     uid: uid,
//     pursuits: updatedPursuits
//   });
//   return newUser.save().then(() => res.json(uid))
//     .catch(err => res.status(400).json('Error: ' + err));


//   // User.Model.findOne({uid: uid}).updateOne({pursuits: updatedPursuits})
//   // .then(
//   //   () => res.json('Updated pursuits!')
//   // ).catch(err => res.status(400).json('Error: ' + err));

// });

module.exports = router;

