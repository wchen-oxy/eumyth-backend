var router = require('express').Router();
let IndexUser = require('../../models/index.user.model');
const { doesValidationErrorExist, validateQueryUsername } = require("../../utils/validators");
const { doesUserExist } = require("../../utils/helper")

const retrieveIndexUser = (username) => {
  return IndexUser.Model
    .findOne({ username: username })
    .then(result => {
      doesUserExist(result);
      return result;
    });
}

router.get('/', validateQueryUsername, doesValidationErrorExist, (req, res, next) => {
  const username = req.query.username;
  return retrieveIndexUser(username)
    .then(result => {
      return (res.status(200).json(result));
    })
    .catch(next)
})

router.get('/pursuits', validateQueryUsername, doesValidationErrorExist, (req, res, next) => {
  const username = req.query.username;
  return retrieveIndexUser(username)
    .then(result => {
      return res.status(200).json(result.pursuits);
    })
    .catch(next)
})

router.get('/username', validateQueryUsername, doesValidationErrorExist, (req, res, next) => {
  const username = req.query.username;
  return retrieveIndexUser(username)
    .then(result => {
      return res.status(200).send();
    })
    .catch(next)
})

module.exports = router;
