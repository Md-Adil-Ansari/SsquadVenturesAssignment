
const AppError = require('./AppError');

class BadRequestError extends AppError {
    constructor(message = 'Bad Request', details = null) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}

module.exports = BadRequestError;
