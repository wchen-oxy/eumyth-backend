class BadRequestError extends Error {
    constructor(error) {
        super(error);
        this.statusCode = 400;
    }
}

class NoContentError extends Error {
    constructor(error) {
        super(error);
        this.statusCode = 404;
    }
}

class TypeError extends Error {
    constructor(error) {
        super(error);
        this.statusCode = 500;
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
    OperationalError: OperationalError,
    TypeError: TypeError
};