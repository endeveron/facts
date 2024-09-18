import { NextFunction, Request, Response } from 'express';

import UserModel from '../models/user.js';
import { HttpError } from '../utils/error.js';
import logger from '../utils/logger.js';
import FactModel from '../models/fact.js';
import { factItemProps } from '../constants/facts.js';

// export const getUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const id = req.params.id;
//   if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//     return next(new HttpError('Invalid user id.', 422));
//   }

//   try {
//     const result = await getItemById<TUser>(UserModel, id);
//     if (result?.error) {
//       return next(
//         new HttpError('The user with the provided ID is not registered.', 404)
//       );
//     }
//     const user = result.data;

//     res.status(200).json({
//       data: {
//         user: removeSensitiveData(user),
//       },
//     });
//   } catch (err) {
//     logger.r('getUser', err);
//     return next(new HttpError('Unable to retrieve user data.', 500));
//   }
// };

export const getFavourites = async (
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
    const favouriteIdArr = user.facts.favourites;
    if (!favouriteIdArr.length) {
      return res.status(200).json({
        data: { favourites: [] },
      });
    }

    const favouriteFacts = await FactModel.find({
      _id: { $in: favouriteIdArr },
    }).select(factItemProps);

    const serializedFavourites = favouriteFacts.map(
      ({ _id, title, category }) => ({
        id: _id.toString(),
        title,
        category,
      })
    );

    res.status(200).json({
      data: { favourites: serializedFavourites },
    });
  } catch (err: any) {
    logger.r('getFavourites', err);
    return next(new HttpError('Unable to fetch user favourites facts.', 500));
  }
};

export const postEvaluateFact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { factId, userId, category } = req.body;
  let status: 'like' | 'dislike' = 'like';

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // Update the user's list of favourites
    const favouritesUpd = [...user.facts.favourites];
    const index = favouritesUpd.indexOf(factId);
    if (index === -1) {
      // Like
      favouritesUpd.push(factId);
    } else {
      // Dislike
      favouritesUpd.splice(index, 1);
      status = 'dislike';
    }
    user.facts.favourites = favouritesUpd;

    // Update the category rate map to capture user preferences
    const categoryRateMap = user.facts.categoryRateMap;
    if (categoryRateMap) {
      const updRateMap = new Map(categoryRateMap);
      const curCategoryRate = updRateMap.get(category) as number;
      let newCategoryRate;
      if (status === 'like') {
        newCategoryRate = curCategoryRate + 1;
      }
      if (status === 'dislike' && curCategoryRate >= 1) {
        newCategoryRate = curCategoryRate - 1;
      }
      if (newCategoryRate) {
        updRateMap.set(category, newCategoryRate);
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

export const getResetFacts = async (
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

    user.facts.offset = 0;
    await user.save();

    res.status(201).json({
      data: {},
    });
  } catch (err) {
    logger.r('reset', err);
    return next(new HttpError('Unable to reset facts.', 500));
  }
};
