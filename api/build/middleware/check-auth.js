import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/error.js';
export const checkAuth = (req, res, next) => {
    var _a;
    if (req.method === 'OPTIONS')
        return next();
    const handleUnauthenticated = () => {
        return next(new HttpError('Authentication failed', 401));
    };
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token)
            return handleUnauthenticated();
        const isTokenValid = jwt.verify(token, process.env.JWT_KEY);
        if (!isTokenValid)
            return handleUnauthenticated();
        next();
    }
    catch (err) {
        handleUnauthenticated();
    }
};
