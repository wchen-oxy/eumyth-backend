const AWSConstants = require('../../../shared/utils/aws');

exports.getMultiple = (imageKeyArray) => {
    const getObject = (imageKey) => new Promise((resolve, reject) => {
        AWSConstants
            .S3_INTERFACE
            .getObject({
                Bucket: AWSConstants.BUCKET_NAME,
                Key: imageKey,
            },
                (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data.Body)
                    }
                }
            )
    })
    return Promise.all(imageKeyArray.map(item => getObject(item)))
}

exports.getSingle = (imageKey) =>
    AWSConstants
        .S3_INTERFACE
        .getObject({
            Bucket: AWSConstants.BUCKET_NAME,
            Key: imageKey,
        }).promise()


exports.deleteSingle = (imageKey) => AWSConstants
    .S3_INTERFACE
    .deleteObject({
        Bucket: AWSConstants.BUCKET_NAME,
        Key: imageKey
    }, function (error, data) {
        if (error) {
            console.log("Something bad happened");
            console.log(error, error.stack);
            throw new Error(error);
        }
        else { console.log("Success", data); }
    })
    .promise();

exports.deleteMultiple = (imageKeyArray) => AWSConstants
    .S3_INTERFACE
    .deleteObjects({
        Bucket: AWSConstants.BUCKET_NAME,
        Delete: {
            Objects: imageKeyArray.map(
                imageKey => {
                    return { Key: imageKey }
                })
        }

    }, function (error, data) {
        if (error) {
            console.log("Something bad happened");
            console.log(error, error.stack);
            throw new Error(error);
        }
        else { console.log("Success", data); }
    })
    .promise();

exports.setAllCroppedImages = (user, normal, small, tiny) => {
    if (normal) { user.cropped_display_photo_key = normal }
    if (small) { user.small_cropped_display_photo_key = small }
    if (tiny) { user.tiny_cropped_display_photo_key}

}