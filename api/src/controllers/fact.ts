import { NextFunction, Request, Response } from 'express';

import { FACT_ITEMS_LIMIT, factItemProps } from '../constants/facts.js';
import FactModel from '../models/fact.js';
import UserModel from '../models/user.js';
import { TFact, TFactItem } from '../types/fact.js';
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

    // get array of favorites facts
    const favorites = user.facts.favorites;

    // OLD get the fact offset
    const offset = user.facts.offset;

    // NEW

    // fetch fact items
    const facts = await FactModel.find({})
      .skip(offset)
      .limit(FACT_ITEMS_LIMIT)
      .select(factItemProps);

    if (facts.length) {
      // serialize fact items
      factItems = configureFactItems(facts);

      // update fact offset value for the user
      user.facts.offset = offset + facts.length;
      await user.save();
    }

    res.status(200).json({
      data: {
        facts: factItems,
        favorites,
      },
    });
  } catch (err) {
    logger.r('getUser', err);
    return next(new HttpError('Unable to retrieve user data.', 500));
  }
};

export const postFact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, category } = req.body;

  try {
    const fact = new FactModel({
      category,
      title,
    });
    await fact.save();

    res.status(201).json({
      data: {
        factId: fact._id.toString(),
      },
    });
  } catch (err) {
    logger.r('postFact', err);
    return next(new HttpError('Unable to add fact to database.', 500));
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

    // get the fact offset
    const offset = user.facts.offset;
    if (offset === undefined) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    // reset fact offset value for the user
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

export const dev = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById('66d31140c92a696257bf4aeb');
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    // get the user's fact offset map
    const offsetMap = user.facts.offsetMap;
    const requestMap = new Map<string, number>();
    const fetchedFactsMap = new Map<string, TFact[]>();

    const calcProportionalDistribution = (
      map: Map<string, number>
    ): Map<string, number> => {
      let resultMap = new Map<string, number>();
      // n = ( value / sum ) * totalItems
      const sum = [...map.values()].reduce((acc, value) => acc + value, 0);
      const totalItems = map.size;
      // fill out the result map
      map.forEach((value: number, key: string) => {
        const result = Math.round((value / sum) * totalItems);
        resultMap.set(key, result);
      });

      // check the result
      const resultSum = [...resultMap.values()].reduce(
        (acc, value) => acc + value,
        0
      );
      if (resultSum === sum) return resultMap;

      // fix the result issue
      const diff = sum - resultSum;
      if (diff > 0) {
        // add up to a greater value
      } else {
      }

      // Temp
      return resultMap;
    };

    const resultMap = calcProportionalDistribution(offsetMap);
    console.log('resultMap', resultMap);

    // generate the map of facts need to be fetched
    for (let category in offsetMap) {
    }

    // update the offset map

    // fetch facts by category

    res.status(200).json({
      data: { resultMap },
    });
  } catch (err) {
    logger.r('getUser', err);
    return next(new HttpError('Dev.', 500));
  }
};
