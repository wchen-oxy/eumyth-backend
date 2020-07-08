var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Grid = require("gridfs-stream");

let gfs;


const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
var port = process.env.PORT || 5000;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var testRouter = require('./routes/test');
var pursuitsRouter = require('./routes/pursuit');
var entryRouter = require('./routes/entry');
var imageRouter = require('./routes/image.js');
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

const GridFsStorage = require("multer-gridfs-storage");
const multer = require('multer');

// Mongoose specific code
const uri = process.env.ATLAS_URI;
console.log(uri);


mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection('posts');
  gfs.collection('images');
  console.log("GFS image connection succesful");
})



// const storage = new GridFsStorage({
//   url: uri,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       console.log("Inner Proimse");
//       // console.log(crypto);
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//             console.log(err);
//             console.loh(1);
//           return reject(err)
//         }
//         console.log(file);
//         const filename = file.originalname
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'uploads',
//         }
//         resolve(fileInfo)
//       })
//     })
//   },
// })

// const upload = multer({ storage });


// app.use('/', indexRouter);
app.use('/image',  function (req, res, next) {
  console.log('the response will be sent by the next function ...');
  req.image_config = {
    gfs: gfs
  };
  next();
}, imageRouter);
app.use('/pursuit', pursuitsRouter);
app.use('/user', usersRouter);
app.use('/test', testRouter);
app.use('/entry', entryRouter);
// app.post('/entry/image', upload.single('img'), (req, res, err) => {
//   if (err) throw err
//   res.status(201).send()
// })
// app.use('/react', reactRouter);

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
