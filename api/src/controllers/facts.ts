import { NextFunction, Request, Response } from 'express';

import { FACT_GROUP_LIMIT, FACT_STORAGE_LIMIT } from '../constants/facts';
import { HttpError } from '../helpers/error';
import {
  calculateSumOfMapValues,
  configureFactItems,
  createFactLimitMap,
} from '../helpers/facts';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import FactModel from '../models/fact';
import UserModel from '../models/user';
import { TCategoryMap, TFactItem } from '../types/fact';

export const getFacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const cat = req.query.category as string;
  const category = cat === 'all' ? '' : cat;
  const userId = req.query.userId;

  let factItems: TFactItem[] = [];
  let factDeficitMap = new Map<string, number>();

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    // get a copy of fact offset map
    const offsetMap = new Map(user.facts.offsetMap);
    // get a copy of user's favorite facts
    const favorites = [...user.facts.favorites];

    /**
     * Retrieves facts of a specified category with pagination support.
     * @returns an object with the following properties:
     * - `facts`: an array of fact items retrieved from the database after applying the specified limit
     * and offset.
     * - `length`: the number of facts retrieved in the current query.
     * - `deficit`: the difference between the specified limit and the actual number of facts
     * retrieved.
     */
    const fetchCategoryFacts = async ({
      category,
      limit,
      offsetMap,
    }: {
      category: string;
      limit: number;
      offsetMap: TCategoryMap;
    }) => {
      // get fact offset
      const offset = offsetMap.get(category) as number;
      // get facts from db
      const facts = await FactModel.find({
        category,
      })
        .skip(offset)
        .limit(limit);

      const length = facts.length;
      if (!length)
        return {
          facts: [],
          length: 0,
          deficit: limit,
        };

      return {
        facts: configureFactItems(facts),
        length,
        deficit: limit - length,
      };
    };

    // if the `category` url param provided, fetch facts of one category
    if (category) {
      const { facts, length } = await fetchCategoryFacts({
        category,
        limit: FACT_GROUP_LIMIT,
        offsetMap,
      });

      if (length) {
        factItems = facts;
        offsetMap.set(category, (offsetMap.get(category) as number) + length);

        // update fact offset map in db
        user.facts.offsetMap = offsetMap;
        await user.save();
      }

      res.status(200).json({
        data: {
          facts: factItems,
          favorites,
        },
      });
      return;
    }

    // if the `category` url param is not provided, fetch facts for all categories
    // create a map of the limits for fetching facts
    const factLimitMap = createFactLimitMap(offsetMap);
    if (!factLimitMap.size) {
      return next(new HttpError('Invalid distribution map.', 500));
    }

    // fetch facts depending on factLimitMap values
    for (let [category, limit] of factLimitMap) {
      if (limit > 0) {
        const { facts, length, deficit } = await fetchCategoryFacts({
          category,
          limit,
          offsetMap,
        });

        // check whether the length of the received facts is less than expected
        if (deficit) {
          factDeficitMap.set(category, deficit);
        }

        if (length) {
          factItems = [...factItems, ...facts];
          offsetMap.set(category, (offsetMap.get(category) as number) + length);
        }
      }
    }

    // check the deficit map
    const totalDeficit = calculateSumOfMapValues(factDeficitMap);
    if (totalDeficit > 0) {
      // TODO: handle the data, maybe save to statistics in db
      // console.info('factDeficitMap', factDeficitMap);
    }

    if (factItems.length) {
      // update fact offset map in db
      user.facts.offsetMap = offsetMap;
      await user.save();

      // shuffle fact items to improve user experience
      // factItems = shuffleFactItems(factItems);
    }

    res.status(200).json({
      data: {
        facts: factItems,
        favorites,
      },
    });
  } catch (err) {
    logger.r('getFacts', err);
    return next(new HttpError('Unable to retrieve facts.', 500));
  }
};

export const getDataToInitLocalDb = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const userId = req.query.userId as string;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    const facts = await FactModel.find().limit(FACT_STORAGE_LIMIT);

    const data = {
      facts: configureFactItems(facts),
      favorites: user.facts.favorites,
    };

    res.status(200).json({ data });
  } catch (err) {
    logger.r('getDataToInitLocalDb', err);
    return next(new HttpError('Unable to retrieve data for local db.', 500));
  }
};

export const getFactsForLocalDbStorage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const offset = req.query.offset as string;
  const userId = req.query.userId as string;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    const facts = await FactModel.find()
      .skip(+offset)
      .limit(FACT_STORAGE_LIMIT);

    const data = {
      facts: configureFactItems(facts),
      done: facts.length <= FACT_STORAGE_LIMIT,
    };

    res.status(200).json({ data });
  } catch (err) {
    logger.r('getFactsForLocalDbStorage', err);
    return next(new HttpError('Unable to retrieve facts.', 500));
  }
};

export const postFact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
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

export const postFactState = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { factState, userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }

    const updatedAt = Date.now();

    user.facts = {
      ...factState,
      updatedAt,
    };
    await user.save();

    res.status(201).json({
      data: { updatedAt },
    });
  } catch (err) {
    logger.r('postFact', err);
    return next(new HttpError('Unable to save fact state.', 500));
  }
};
