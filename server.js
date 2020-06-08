var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
var port = process.env.PORT || 5000;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var testRouter = require('./routes/test');
var pursuitsRouter = require('./routes/pursuit');

var reactRouter = require('./routes/reactTest');


var app = express();

var firebaseInstance = require('./firebase/firebase');
var firebase = new firebaseInstance();
console.log(firebase.test());

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


mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

app.use('/', indexRouter);
app.use('/pursuit', pursuitsRouter);
app.use('/user', usersRouter);
app.use('/test', testRouter);
app.use('/react', reactRouter);

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
console.log("Server is now running");
module.exports = app;
