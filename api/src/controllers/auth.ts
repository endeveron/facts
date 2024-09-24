import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { Id } from '../types/common.js';
import { HttpError } from '../helpers/error.js';
import { getItem } from '../helpers/getFromDb.js';
import logger from '../helpers/logger.js';

import { removeSensitiveData } from '../helpers/user.js';
import UserModel from '../models/user.js';
import { TUser } from '../types/user.js';
import { createCategoryMap } from '../helpers/facts.js';
import { isReqValid } from '../helpers/http.js';

const genetrateJWToken = (userId: Id, next: NextFunction) => {
  const jwtKey = process.env.JWT_KEY;

  const handleJWTException = () =>
    next(new HttpError(`Could not generate token.`, 500));

  try {
    if (!jwtKey) return handleJWTException();
    const token = jwt.sign({ userId }, jwtKey, { expiresIn: '48h' });
    return token;
  } catch (err: any) {
    logger.r('genetrateJWToken', err?._message || err);
    return handleJWTException();
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { name, email, password } = req.body;

  try {
    // check if email in use.
    const emailInUse = await UserModel.exists({ 'account.email': email });

    if (emailInUse) {
      return next(new HttpError('Email in use', 409));
    }

    // hashing the provided password.
    const hashedPassword = await bcrypt.hash(password, 12);

    // generate a category offset map
    const categoryRateMap = createCategoryMap();
    const offsetMap = createCategoryMap();

    // create a new user.
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
        favorites: [],
        categoryRateMap,
        offsetMap,
      },
    });

    await user.save();

    // generate JWT.
    const userId = user._id.toString();
    const token = genetrateJWToken(userId, next);

    // successfully signed up.
    res.status(201).json({
      data: {
        token,
        user: removeSensitiveData(user),
      },
    });
  } catch (err) {
    logger.r('Signup', err);
    return next(
      new HttpError('Could not create account. Please try again later.', 500)
    );
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { email, password } = req.body;

  try {
    // get user account data from the DB.
    const userData = await getItem<TUser>(UserModel, {
      'account.email': email,
    });
    if (userData?.error) {
      return next(
        new HttpError(
          'There is no account has been registered for this email address',
          404
        )
      );
    }
    const user = userData.data;

    // check provided password.
    const isPasswordValid = await bcrypt.compare(
      password,
      user.account.password
    );
    if (!isPasswordValid) {
      return next(new HttpError('Invalid password', 401));
    }

    // generate JWT
    const token = genetrateJWToken(user._id, next);

    // successfully signed in.
    res.status(200).json({
      data: {
        token,
        user: removeSensitiveData(user),
      },
    });
  } catch (err) {
    logger.r('Login', err);
    return next(new HttpError('Login failed. Please try again later', 500));
  }
};
