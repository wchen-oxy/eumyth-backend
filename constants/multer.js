const AwsConstants = require('./aws');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid');

const profileImageUpload = multer({
    storage: multerS3({
        s3: AwsConstants.S3_INTERFACE,
        bucket: AwsConstants.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, "images/profile/" + uuid.v1())
        }
    })
}, function (err, data) {
    if (err) {
        console.log(err, err.stack);
        throw new Error("Something went wrong while uploading the file to  Amazon.", err)
    };
});

const contentImageUpload = multer({
    storage: multerS3({
        s3: AwsConstants.S3_INTERFACE,
        bucket: AwsConstants.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, "images/content/" + uuid.v1())
        }
    })
});

module.exports = {
    profileImageUpload: profileImageUpload,
    contentImageUpload: contentImageUpload
}