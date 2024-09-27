import { NextFunction, Request, Response } from 'express';

import UserModel from '../models/user.js';
import { HttpError } from '../helpers/error.js';
import logger from '../helpers/logger.js';
import FactModel from '../models/fact.js';
import { FACT_PROPS } from '../constants/facts.js';
import { createCategoryMap } from '../helpers/facts.js';
import { isReqValid } from '../helpers/http.js';
import { decryptText, encryptText } from '../helpers/crypto.js';

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }
    const favoriteIdArr = user.facts.favorites;
    if (!favoriteIdArr.length) {
      return res.status(200).json({
        data: { favorites: [] },
      });
    }

    const favoriteFacts = await FactModel.find({
      _id: { $in: favoriteIdArr },
    }).select(FACT_PROPS);

    const serializedFavorites = favoriteFacts.map(
      ({ _id, title, category }) => ({
        id: _id.toString(),
        title,
        category,
      })
    );

    res.status(200).json({
      data: { favorites: serializedFavorites },
    });
  } catch (err: any) {
    logger.r('getFavorites', err);
    return next(new HttpError('Unable to fetch user favorites facts.', 500));
  }
};

export const resetFacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }
    if (!user.facts.offsetMap) {
      return next(new HttpError('Could not fetch fact offset map.', 500));
    }

    // reset facts data for the user
    const defaultOffsetMap = createCategoryMap();
    user.facts.offsetMap = defaultOffsetMap;
    await user.save();

    res.status(200).json({
      data: {},
    });
  } catch (err) {
    logger.r('getUser', err);
    return next(new HttpError('Unable to retrieve user data.', 500));
  }
};

export const evaluateFact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { factId, userId, category } = req.body;
  let status: 'like' | 'dislike' = 'like';

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // update the user's list of favorites
    const favoritesUpd = [...user.facts.favorites];
    const index = favoritesUpd.indexOf(factId);
    if (index === -1) {
      // like
      favoritesUpd.push(factId);
    } else {
      // dislike
      favoritesUpd.splice(index, 1);
      status = 'dislike';
    }
    user.facts.favorites = favoritesUpd;

    // update the category rate map to capture user preferences
    const categoryRateMap = user.facts.categoryRateMap;
    if (categoryRateMap) {
      const updRateMap = new Map(categoryRateMap);
      const curCategoryRate = updRateMap.get(category) as number;
      let updCategoryRate = -1;
      if (status === 'like') {
        updCategoryRate = curCategoryRate + 1;
      }
      if (status === 'dislike' && curCategoryRate > 0) {
        updCategoryRate = curCategoryRate - 1;
      }
      if (updCategoryRate !== -1) {
        updRateMap.set(category, updCategoryRate);
        user.facts.categoryRateMap = updRateMap;
      }
    } else {
      logger.r('postEvaluateFact: Invalid offsetMap.');
    }

    await user.save();

    res.status(201).json({
      data: { status },
    });
  } catch (err) {
    logger.r('postEvaluateFact', err);
    return next(new HttpError('Unable to evaluate fact.', 500));
  }
};

export const createNotificationsSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { expoPushToken, userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // check if a subscription already exists
    if (user.notificationsSubscr !== null) {
      return next(new HttpError('Subscription already exists', 409));
    }

    // encrypt the token
    const { data, iv } = encryptText(expoPushToken);
    const notificationsSubscr = {
      token: {
        data,
        iv,
      },
      isActive: true,
    };
    user.notificationsSubscr = notificationsSubscr;
    // const decrypted = decryptText(encryptedData);

    await user.save();

    res.status(200).json({
      data: { success: true },
    });
  } catch (err) {
    logger.r('postEvaluateFact', err);
    return next(new HttpError('Unable to evaluate fact.', 500));
  }
};

export const getNotificationsSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    const subscription = user.notificationsSubscr;

    res.status(201).json({
      data: {
        isToken: !!subscription?.token?.data,
        isActive: !!subscription?.isActive,
      },
    });
  } catch (err) {
    logger.r('postEvaluateFact', err);
    return next(new HttpError('Unable to evaluate fact.', 500));
  }
};
