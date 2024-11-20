const sendSuccess = (res, { data = null, message = null, meta = null }, statusCode = 200) => {
    const response = {
        status: 'success',
        data,
        ...(message && { message }),
        ...(meta && { meta }),
    };

    res.status(statusCode).json(response);
};

const sendError = (res, { code = 'INTERNAL_SERVER_ERROR', message = 'An unexpected error occurred.', details = null }, statusCode = 500) => {
    const response = {
        status: 'error',
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };

    res.status(statusCode).json(response);
};

module.exports = {
    sendSuccess,
    sendError
};
