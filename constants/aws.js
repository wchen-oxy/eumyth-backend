// Enter copied or downloaded access ID and secret key here
const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_KEY;
// The name of the bucket that you have created
const BUCKET_NAME = 'eumyth-bucket-1';

module.exports = {
    ID: ID,
    SECRET: SECRET,
    BUCKET_NAME: BUCKET_NAME
  };