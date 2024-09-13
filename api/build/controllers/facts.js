import { FACT_ITEMS_LIMIT, factItemProps } from '../constants/facts.js';
import FactModel from '../models/fact.js';
import UserModel from '../models/user.js';
import { HttpError } from '../utils/error.js';
import { configureFactItems } from '../utils/facts.js';
import logger from '../utils/logger.js';
export const getFacts = async (req, res, next) => {
  const userId = req.params.userId;
  let factItems = [];
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }
    const liked = user.facts.liked;
    const offset = user.facts.offset;
    if (offset === undefined) {
      return next(new HttpError('Could not fetch user data.', 500));
    }
    const facts = await FactModel.find({})
      .skip(offset)
      .limit(FACT_ITEMS_LIMIT)
      .select(factItemProps);
    if (facts.length) {
      factItems = configureFactItems(facts);
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
export const resetStatistics = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new HttpError('Could not fetch user data.', 500));
    }
    const offset = user.facts.offset;
    if (offset === undefined) {
      return next(new HttpError('Could not fetch user data.', 500));
    }
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
