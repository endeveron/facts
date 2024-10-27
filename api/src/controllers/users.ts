import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../helpers/error';
import { createCategoryMap } from '../helpers/facts';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import FactModel from '../models/fact';
import UserModel from '../models/user';

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.query.userId as string;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }
    const favoriteIdArr = user.facts.favorites;
    if (!favoriteIdArr.length) {
      res.status(200).json({
        data: { favorites: [] },
      });
      return;
    }

    const favoriteFacts = await FactModel.find({
      _id: { $in: favoriteIdArr },
    });

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
  const userId = req.query.userId as string;

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
    logger.r('resetFacts', err);
    return next(new HttpError('Unable to reset facts.', 500));
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
