import { NextFunction, Request, Response } from 'express';

import {
  FACT_ITEMS_LIMIT,
  factsSelectedProperies,
} from '../constants/facts.js';
import FactModel from '../models/fact.js';
import UserModel from '../models/user.js';
import { TFactItem } from '../types/fact.js';
import { HttpError } from '../utils/error.js';
import { configureFactItems } from '../utils/facts.js';
import logger from '../utils/logger.js';

export const getFacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  let factItems: TFactItem[] = [];

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    // Get array of liked facts
    const liked = user.facts.liked;

    // Get the fact offset
    const offset = user.facts.offset;

    // Fetch fact items
    const facts = await FactModel.find({})
      .skip(offset)
      .limit(FACT_ITEMS_LIMIT)
      .select(factsSelectedProperies);

    if (facts.length) {
      // Serialize fact items
      factItems = configureFactItems(facts);

      // Update fact offset value for the user
      user.facts.offset = offset + facts.length;
      await user.save();
    }

    res.status(200).json({
      data: {
        facts: factItems,
        liked,
      },
    });
  } catch (err) {
    logger.r('getUser', err);
    return next(new HttpError('Unable to retrieve user data.', 500));
  }
};

export const resetStatistics = async (
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

    // Get the fact offset
    const offset = user.facts.offset;
    if (offset === undefined) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    // Reset fact offset value for the user
    user.facts.offset = 0;
    await user.save();

    res.status(200).json({
      data: {},
    });
  } catch (err) {
    logger.r('getUser', err);
    return next(new HttpError('Unable to retrieve user data.', 500));
  }
};
