const express = require('express');
const router = express.Router();
const selectModel = require('../../models/modelServices');
const { findByID, deleteByID, deleteManyByID} = require('../../data-access/dal');

/* GET users listing. */
router.route('/')
  .get((req, res, next) => {
    console.log('test reach');
    return findByID('USER', '6109b35239e0a3126c61bd77')
      .then((result) => {
        const completeUser = result;
        const _removeProject = (array, ID) => {
          for (let i = 0; i < array.length; i++) {
            if (array[i].post_id.toString() === ID) {
              array.splice(i, 1)
            }
          }
        }
        console.log(completeUser.pursuits[0].projects);
        _removeProject(completeUser.pursuits[0].projects, '6194357295a198bb28c6bdd1');
        console.log(completeUser.pursuits[0].projects);


        return res.status(200).send('success');
      })
      .catch(err => { console.log(err); return res.status(500).send(err) })
  })
  .delete((req, res, next) => {
    console.log("adsfadsf");
    console.log(req.query);
    // return deleteByID( 'POST', '6193ee01870f72b5cefc1b4c')
    return deleteManyByID( 'POST', ['619594b25a041ad2b339871f', '619594b15a041ad2b339871e'])
      .then(() => res.status(200).send('FIN'))
  })

module.exports = router;
