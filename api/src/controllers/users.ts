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
    const likedIdArr = user.facts.liked;
    if (!likedIdArr.length) {
      return res.status(200).json({
        data: { liked: [] },
      });
    }

    const likedFacts = await FactModel.find({
      _id: { $in: likedIdArr },
    }).select(factItemProps);

    const serializedFavorites = likedFacts.map(
      ({ _id, title, details, category, source }) => ({
        id: _id.toString(),
        title,
        details,
        category,
        source,
      })
    );

    res.status(200).json({
      data: { liked: serializedFavorites },
    });
  } catch (err: any) {
    logger.r('getFavorites', err);
    return next(new HttpError('Unable to fetch user liked facts.', 500));
  }
};

export const postEvaluateFact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { factId, userId } = req.body;
  let status = '';

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // Check the user's list of liked facts to like or dislike
    const likedUpd = [...user.facts.liked];
    const index = likedUpd.indexOf(factId);
    if (index === -1) {
      // Like
      likedUpd.push(factId);
      status = 'liked';
    } else {
      // Dislike
      likedUpd.splice(index, 1);
      status = 'disliked';
    }

    user.facts.liked = likedUpd;
    await user.save();

    res.status(201).json({
      data: { status },
    });
  } catch (err) {
    logger.r('postEvaluateFact', err);
    return next(new HttpError('Unable to evaluate fact.', 500));
  }
};
