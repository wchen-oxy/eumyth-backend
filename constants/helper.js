const resultCallback = (err, doc) => {
    if (err) {
        throw new Error(err);
    }
}

const errorCallback = (err) => {
    console.log(err);
    return res.status(500).json({ error: err });
}

module.exports = {
    resultCallback: resultCallback,
    errorCallback: errorCallback

}