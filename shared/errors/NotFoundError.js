
const AppError = require('./AppError');

class NotFoundError extends AppError {
    constructor(message = 'Not Found', details = null) {
        super(message, 404, 'NOT_FOUND', details);
    }
}

module.exports = NotFoundError;
