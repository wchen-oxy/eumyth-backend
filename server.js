require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const port = process.env.PORT || 5000;
const indexRouter = require("./routes/v0/index")
const fs = require('fs');
var app = express();

// Mongoose specific code
const uri = process.env.ATLAS_URI;

// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors()); //for serving cross origin content on same machine
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "build")));

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

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));
app.use('/api', indexRouter);
try {
  const buildExists = fs.existsSync(path.join(__dirname, 'build'));
  if (buildExists && process.argv.slice(2)[0]) {
    console.log("Production Build")
    app.get('/*', function (req, res) {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    })
  }
  else {
    console.log("Development Build")
    console.log(buildExists ? "Build Folder Detected" : "No Build Folder Detected");
  }
} catch (err) {
  console.error(err);
}

process.env.IS_LOCAL ? console.log("Local Development") : app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

// catch 404 and forward to error handler
app.use((error, req, res, next) => {
  console.log("error handler", error.statusCode);
  if (!error.statusCode) error.statusCode = 500;
  console.log(error.statusCode);
  next(createError(error.statusCode));
});

console.log("Server is now running");
module.exports = app;
