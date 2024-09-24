import { NextFunction, Request, Response } from 'express';

import { FACT_ITEMS_LIMIT, FACT_PROPS } from '../constants/facts.js';
import { HttpError } from '../helpers/error.js';
import {
  calculateSumOfMapValues,
  configureFactItems,
  createFactLimitMap,
  shuffleFactItems,
} from '../helpers/facts.js';
import { isReqValid } from '../helpers/http.js';
import logger from '../helpers/logger.js';
import FactModel from '../models/fact.js';
import UserModel from '../models/user.js';
import { TCategoryMap, TFactItem } from '../types/fact.js';

export const getFacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const userId = req.params.userId;
  const category = req.params.category === 'all' ? '' : req.params.category;
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
        .limit(limit)
        .select(FACT_PROPS);

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
        limit: FACT_ITEMS_LIMIT,
        offsetMap,
      });

      if (length) {
        factItems = facts;
        offsetMap.set(category, (offsetMap.get(category) as number) + length);

        // update fact offset map in db
        user.facts.offsetMap = offsetMap;
        await user.save();
      }

      return res.status(200).json({
        data: {
          facts: factItems,
          favorites,
        },
      });
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
    logger.r('getUser', err);
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
