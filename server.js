require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const port = process.env.PORT || 5000;
const indexUserRouter = require('./routes/v0/index');
const usersRouter = require('./routes/v0/user');
const testRouter = require('./routes/v0/test');
const pursuitsRouter = require('./routes/v0/pursuit');
const postRouter = require('./routes/v0/post');
const imageRouter = require('./routes/v0/image');
const draftRouter = require('./routes/v0/draft');
const relationRouter = require('./routes/v0/relation');
const projectRouter = require('./routes/v0/project');
const commentRouter = require('./routes/v0/comment');
const UserPreviewRouter = require('./routes/v0/userPreview');
var app = express();

// Mongoose specific code
const uri = process.env.ATLAS_URI;
console.log(uri);

// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//for serving cross origin content on same machine
app.use(cors());

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,  "build")));
app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(
  uri,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true
  }).catch(err => console.log(err));


const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

app.use('/pursuit', pursuitsRouter);
app.use('/index', indexUserRouter);
app.use('/user', usersRouter);
app.use('/test', testRouter);
app.use('/post', postRouter);
app.use('/relation', relationRouter);
app.use('/project', projectRouter);
app.use('/image', imageRouter);
app.use('/draft', draftRouter);
app.use('/comment', commentRouter);
app.use('/user-preview', UserPreviewRouter);

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

 app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
console.log("Server is now running");
module.exports = app;
