var router = require('express').Router();
let Pursuit = require('../models/pursuit.model');
let User = require('../models/user.model');


// router.route('/').get((req, res) => {
//     User.find()
//       .then(users => res.json(users))
//       .catch(err => res.status(400).json('Error: ' + err));
//   });
  
  router.route('/').post((req, res) => {
    const pursuitsArray = req.body.pursuits;
    const uid = req.body.uid;
    let updatedPursuits = []; 
    for (pursuit of pursuitsArray){
      console.log(pursuit.name);
      
      const entry = new Pursuit.Model({
        name: pursuit.name,
        description: pursuit.description,
        events: pursuit.events
      });
      updatedPursuits.push(entry);
    }
    User.Model.findOne({uid: uid}).update({pursuits: updatedPursuits})
    .then(
      () => res.json('Updated pursuits!')
    ).catch(err => res.status(400).json('Error: ' + err));
    
  });
  
  module.exports = router;
  
  