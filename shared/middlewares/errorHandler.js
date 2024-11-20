
const AppError = require('../errors/AppError');

const errorHandler = (err, req, res, next) => {
    if (!(err instanceof AppError)) {
        console.error('Unhandled Error:', err);
        err = new AppError('Internal Server Error', 500, 'INTERNAL_SERVER_ERROR');
    }

    const { statusCode, code, message, details } = err;

    res.status(statusCode).json({
        status: 'error',
        error: {
            code,
            message,
            ...(details && { details }),
        }
    });
};

module.exports = errorHandler;
