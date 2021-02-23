var router = require('express').Router();
let IndexUser = require('../../models/index.user.model');

router.get('/', (req, res) => {
  const username = req.query.username;
  return IndexUser.Model
    .findOne({ username: username })
    .then(result => {
      if (!result) throw new Error(204);
      return (res.status(200).json(result));
    })
    .catch(error => {
      console.log(error);
      if (error.status === 204) {
        return res.status(204).json({ error: "No IndexUser found." });
      }
      return res.status(500).json({ error: error });
    })
})

router.get('/pursuits', (req, res) => {
  const username = req.query.username;
  return IndexUser.Model
    .findOne({ username: username })
    .then(result => {
      if (!result) throw new Error(204);
      return res.status(200).json(result.pursuits);
    })
    .catch(error => {
      console.log(error);
      if (error.status === 204) {
        return res.status(204).json({ error: "No IndexUser found." });
      }
      return res.status(500).json({ error: error });
    })
})

router.get('/username', (req, res) => {
  const username = req.query.username;
  return IndexUser.Model
    .findOne({ username: username })
    .then(result => {
      if (result) return res.status(200).send("Username exists");
      else {
        return res.status(204).send("Username not Found!");
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: error });
    })
})

module.exports = router;
