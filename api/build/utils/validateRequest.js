import { validationResult } from 'express-validator';
import { HttpError } from './error.js';
const handleHttpError = (errData, next) => {
    const errArray = errData.array();
    const result = [];
    errArray.forEach((error) => {
        if (error.type === 'alternative') {
            result.push(`There are ${error.nestedErrors.length} errors under this alternative list.`);
        }
        else if (error.type === 'field') {
            result.push(`${error.msg} '${error.value}' for '${error.path}'.`);
        }
    });
    const errorMessage = result.length ? result.join(' ') : `Check your data`;
    next(new HttpError(errorMessage, 400));
};
const isReqValid = (req, next) => {
    const errData = validationResult(req);
    if (!errData.isEmpty()) {
        handleHttpError(errData, next);
        return false;
    }
    return true;
};
export { isReqValid };
