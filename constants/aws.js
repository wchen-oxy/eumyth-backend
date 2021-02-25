require('dotenv').config();
const AWS = require('aws-sdk');
// Enter copied or downloaded access ID and secret key here
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_KEY;
// The name of the bucket that you have created
const BUCKET_NAME = 'eumyth-bucket-1';
const REGION = 'us-west-1';
const S3 = new AWS.S3({
  region: REGION,
  accessKeyId: ID,
  secretAccessKey: SECRET
});

const returnUserImageURL = (key) => {
  if (key) {
    return ("https://" + BUCKET_NAME + ".s3." + REGION + ".amazonaws.com/" + key);
  }
  else {
    return ("https://" + BUCKET_NAME + ".s3." + REGION + ".amazonaws.com/");
  }
}

module.exports = {
  returnUserImageURL: returnUserImageURL,
  REGION: REGION,
  ID: ID,
  SECRET: SECRET,
  BUCKET_NAME: BUCKET_NAME,
  S3_INTERFACE: S3
};