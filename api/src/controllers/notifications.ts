import { NextFunction, Request, Response } from 'express';

import { decryptText, encryptText } from '../helpers/crypto.js';
import { HttpError } from '../helpers/error.js';
import { isReqValid } from '../helpers/http.js';
import logger from '../helpers/logger.js';
import {
  sendNotificationToClients,
  sendNotificationToSingleClient,
} from '../helpers/notifications.js';
import UserModel from '../models/user.js';

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

// export const getNotificationsSubscriptionStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.params.userId;

//   try {
//     const user = await UserModel.findById(userId);
//     if (!user) {
//       return next(
//         new HttpError('Unable to find a user with the specified ID.', 404)
//       );
//     }

//     const subscription = user.notificationsSubscr;

//     res.status(201).json({
//       data: {
//         isToken: !!subscription?.token?.data,
//         isActive: !!subscription?.isActive,
//       },
//     });
//   } catch (err) {
//     logger.r('postEvaluateFact', err);
//     return next(new HttpError('Unable to evaluate fact.', 500));
//   }
// };

export const sendNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { notification, userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    const subscription = user.notificationsSubscr;

    // check if the subscription already exists and active
    if (!subscription || !subscription.isActive) {
      return next(new HttpError('Subscription is not active', 403));
    }

    // get the token data
    const encryptedData = subscription.token;
    if (!encryptedData) {
      return next(new HttpError('Invalid token data', 500));
    }

    // decrypt the token
    const expoPushToken = decryptText(encryptedData);

    // send a message to single client
    const result = await sendNotificationToSingleClient(
      notification,
      expoPushToken
    );

    // // send a message to clients
    // const result = await sendNotificationToClients(notification, [
    //   expoPushToken,
    // ]);

    res.status(200).json({
      data: result.data,
      error: result.error,
    });
  } catch (err) {
    logger.r('postEvaluateFact', err);
    return next(new HttpError('Unable to evaluate fact.', 500));
  }
};
