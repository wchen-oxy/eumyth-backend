const AWS = require('aws-sdk');
// Enter copied or downloaded access ID and secret key here
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_KEY;
// The name of the bucket that you have created
const BUCKET_NAME = 'eumyth-bucket-1';

const S3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});

module.exports = {
  ID: ID,
  SECRET: SECRET,
  BUCKET_NAME: BUCKET_NAME,
  S3_INTERFACE: S3
};