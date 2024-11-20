const jwt = require('jsonwebtoken');
const {tokenBlacklist} = require('../controllers/userController')
const UnauthorizedError=require('../../../../shared/errors/UnauthorizedError')
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Authorization header missing or malformed.');
    }

    const token = authHeader.split(' ')[1];

    if (tokenBlacklist.has(token)) {
        throw new UnauthorizedError('Token has been revoked. Please log in again.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw new UnauthorizedError('Invalid or expired token.');
    }
};

module.exports = authMiddleware;
