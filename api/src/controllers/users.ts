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
    }).select(factItemProps);

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
      let newCategoryRate = -1;
      if (status === 'like') {
        newCategoryRate = curCategoryRate + 1;
      }
      if (status === 'dislike' && curCategoryRate > 0) {
        newCategoryRate = curCategoryRate - 1;
      }
      if (newCategoryRate !== -1) {
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
