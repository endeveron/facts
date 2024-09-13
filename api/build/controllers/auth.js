import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/error.js';
import { getItem } from '../utils/getFromDb.js';
import logger from '../utils/logger.js';
import { isReqValid } from '../utils/validateRequest.js';
import { removeSensitiveData } from '../utils/user.js';
import UserModel from '../models/user.js';
const genetrateJWToken = (userId, next) => {
    const jwtKey = process.env.JWT_KEY;
    const handleJWTException = () => next(new HttpError(`Could not generate token.`, 500));
    try {
        if (!jwtKey)
            return handleJWTException();
        const token = jwt.sign({ userId }, jwtKey, { expiresIn: '48h' });
        return token;
    }
    catch (err) {
        logger.r('genetrateJWToken', (err === null || err === void 0 ? void 0 : err._message) || err);
        return handleJWTException();
    }
};
export const signup = async (req, res, next) => {
    if (!isReqValid(req, next))
        return;
    const { name, email, password } = req.body;
    try {
        const emailInUse = await UserModel.exists({ 'account.email': email });
        if (emailInUse) {
            return next(new HttpError('Email in use', 409));
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new UserModel({
            account: {
                name,
                email,
                password: hashedPassword,
                role: {
                    index: 1,
                    name: 'user',
                },
            },
            facts: {
                liked: [],
                offset: 0,
            },
        });
        await user.save();
        const userId = user._id.toString();
        const token = genetrateJWToken(userId, next);
        res.status(201).json({
            data: {
                token,
                user: removeSensitiveData(user),
            },
        });
    }
    catch (err) {
        logger.r('Signup', err);
        return next(new HttpError('Could not create account. Please try again later.', 500));
    }
};
export const signin = async (req, res, next) => {
    if (!isReqValid(req, next))
        return;
    const { email, password } = req.body;
    try {
        const userData = await getItem(UserModel, {
            'account.email': email,
        });
        if (userData === null || userData === void 0 ? void 0 : userData.error) {
            return next(new HttpError('There is no account has been registered for this email address', 404));
        }
        const user = userData.data;
        let isPasswordValid = false;
        isPasswordValid = await bcrypt.compare(password, user.account.password);
        if (!isPasswordValid) {
            return next(new HttpError('Invalid password', 401));
        }
        const token = genetrateJWToken(user._id, next);
        res.status(200).json({
            data: {
                token,
                user: removeSensitiveData(user),
            },
        });
    }
    catch (err) {
        logger.r('Login', err);
        return next(new HttpError('Login failed. Please try again later', 500));
    }
};
