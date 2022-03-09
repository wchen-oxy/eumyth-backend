const express = require('express');
var router = express.Router();
const indexUserRouter = require('./indexUser');
const usersRouter = require('./user');
const testRouter = require('./test');
const pursuitRouter = require('./pursuit');
const postRouter = require('./post');
const imageRouter = require('./image');
const draftRouter = require('./draft');
const relationRouter = require('./relation');
const projectRouter = require('./project');
const projectPreviewRouter = require('./projectPreview');
const commentRouter = require('./comment');
const userPreviewRouter = require('./userPreview');
const searchRouter = require('./search');

router.use('/pursuit', pursuitRouter);
router.use('/index-user', indexUserRouter);
router.use('/user', usersRouter);
router.use('/test', testRouter);
router.use('/post', postRouter);
router.use('/relation', relationRouter);
router.use('/project', projectRouter);
router.use('/project-preview', projectPreviewRouter);
router.use('/image', imageRouter);
router.use('/draft', draftRouter);
router.use('/comment', commentRouter);
router.use('/user-preview', userPreviewRouter);
router.use('/search', searchRouter)

module.exports = router;
