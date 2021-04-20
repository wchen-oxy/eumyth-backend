class BadRequestError extends Error {
    constructor(error) {
        super(error);
        this.statusCode = 400;
    }
}

class NoContentError extends Error {
    constructor(error) {
        super(ErrorEvent);
        this.statusCode = 404;
    }
}

class OperationalError extends Error {
    constructor(error) {
        super(error);
        this.statusCode = 500;
    }
}

module.exports = {
    BadRequestError: BadRequestError,
    NoContentError: NoContentError,
    OperationalError: OperationalError
};