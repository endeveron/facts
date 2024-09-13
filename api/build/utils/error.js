import logger from './logger.js';
export class HttpError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.code = errorCode;
    }
}
export const handleHttpError = (err, req, res, next) => {
    logger.r('Error', err.message);
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.code || 500);
    res.json({
        error: {
            message: err.message,
            statusCode: err.code,
        },
    });
};
