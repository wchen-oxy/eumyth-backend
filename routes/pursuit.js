var router = require('express').Router();
let Pursuit = require('../models/pursuit.model');
let User = require('../models/user.model');

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
    const uid = req.body.uid;
    console.log(uid);
    User.Model.findOne({uid: uid})
      .then(
        user => res.json(user.pursuits)
        )
      .catch(err => res.status(400).json('Error: ' + err));
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
  
  router.route('/').post((req, res) => {
    console.log("HIT POST ROUTE");
    const pursuitsArray = req.body.pursuits;
    const uid = req.body.uid;
    console.log(pursuitsArray);
    let updatedPursuits = []; 
    for (const pursuit of pursuitsArray){
      console.log(pursuit.value);
      
      const entry = new Pursuit.Model({
        name: pursuit.value
      });
      updatedPursuits.push(entry);
    }
    console.log(updatedPursuits);
    console.log(uid);
    //create one, there isnt one rn
    const newUser = new User.Model({
      uid:uid,
      pursuits:updatedPursuits
    });
    newUser.save().then(() => res.json(uid))
    .catch(err => res.status(400).json('Error: ' + err));
    

    // User.Model.findOne({uid: uid}).updateOne({pursuits: updatedPursuits})
    // .then(
    //   () => res.json('Updated pursuits!')
    // ).catch(err => res.status(400).json('Error: ' + err));
    
  });
  
  module.exports = router;
  
  