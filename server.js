var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Grid = require("gridfs-stream");

let gfs;
let db;


const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
var port = process.env.PORT || 5000;


var indexRouter = require('./routes/v0/index');
var usersRouter = require('./routes/v0/user');
var testRouter = require('./routes/v0/test');
var pursuitsRouter = require('./routes/v0/pursuit');
var entryRouter = require('./routes/v0/entry');
var imageRouter = require('./routes/v0/image.js');
var draftRouter = require('./routes/v0/draft.js');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

// Mongoose specific code
const uri = process.env.ATLAS_URI;
console.log(uri);


mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, autoIndex: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
  gfs = Grid(connection.db, mongoose.mongo);
  db = connection.db;
  gfs.collection('posts');
  gfs.collection('images');
  console.log("GFS image connection succesful");
})

app.use('/image', function (req, res, next) {
  console.log('the response will be sent by the next function ...');
  req.image_config = {
    gfs: gfs,

  };
  next();
}, imageRouter);
app.use('/draft', function (req, res, next) {
  console.log('the response will be sent by the next function ...');
  req.draft_config = {
    gfs: gfs,
    db: db
  };
  next();
}, draftRouter);
app.use('/pursuit', pursuitsRouter);
app.use('/user', usersRouter);
app.use('/test', testRouter);
app.use('/entry', entryRouter);

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
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
