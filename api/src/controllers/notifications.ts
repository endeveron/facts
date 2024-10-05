import { NextFunction, Request, Response } from 'express';

import { decryptText, encryptText } from '../helpers/crypto';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import { sendNotificationToSingleClient } from '../helpers/notifications';
import UserModel from '../models/user';

export const createNotificationSubscription = async (
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
      schedule: null,
    };
    user.notificationsSubscr = notificationsSubscr;
    await user.save();

    res.status(200).json({
      data: { success: true },
    });
  } catch (err) {
    logger.r('postEvaluateFact', err);
    return next(new HttpError('Unable to evaluate fact.', 500));
  }
};

export const createNotificationSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { schedule, userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // check if the subscription exist
    if (user.notificationsSubscr === null) {
      return next(new HttpError('No subscription exists', 404));
    }

    user.notificationsSubscr.schedule = schedule;
    await user.save();

    res.status(201).json({
      data: { success: true },
    });
  } catch (err) {
    logger.r('createNotificationSchedule', err);
    return next(new HttpError('Unable to update notification schedule', 500));
  }
};

export const deleteNotificationSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { schedule, userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // check if the subscription exist
    if (user.notificationsSubscr === null) {
      return next(new HttpError('No subscription exists', 404));
    }

    // update user data
    user.notificationsSubscr.schedule = null;
    await user.save();

    res.status(201).json({
      data: { success: true },
    });
  } catch (err) {
    logger.r('createNotificationSchedule', err);
    return next(new HttpError('Unable to update notification schedule', 500));
  }
};

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
