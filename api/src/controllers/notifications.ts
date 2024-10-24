import { NextFunction, Request, Response } from 'express';

import { decryptText, encryptText } from '../helpers/crypto';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import { sendNotificationToSingleClient } from '../helpers/notifications';
import UserModel from '../models/user';

export const getNotificationSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.query.userId as string;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    if (!user.notificationSubscr) {
      res.status(200).json({ data: null });
      return;
    }

    let expoPushToken = null;
    const encryptedToken = user.notificationSubscr.token;
    // decrypt the token
    if (encryptedToken) expoPushToken = decryptText(encryptedToken);

    const data = {
      token: expoPushToken,
      isActive: user.notificationSubscr.isActive,
      schedule: user.notificationSubscr.schedule,
    };

    res.status(200).json({ data });
  } catch (err) {
    logger.r('getNotificationSubscription', err);
    return next(new HttpError('Unable to get subscription data', 500));
  }
};

export const deleteNotificationSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.query.userId as string;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    user.notificationSubscr = null;
    await user.save();
    res.status(200).json({ data: { success: true } });
  } catch (err) {
    logger.r('deleteNotificationSubscription', err);
    return next(new HttpError('Unable to delete subscription', 500));
  }
};

export const createNotificationSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { subscription, userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // encrypt the token
    const { data, iv } = encryptText(subscription.expoPushToken);
    const notificationSubscr = {
      isActive: subscription.isActive,
      schedule: subscription.schedule,
      token: {
        data,
        iv,
      },
    };

    // create subscription
    user.notificationSubscr = notificationSubscr;
    await user.save();

    res.status(200).json({
      data: { success: true },
    });
  } catch (err) {
    logger.r('createNotificationSubscription', err);
    return next(new HttpError('Unable to create subscription', 500));
  }
};

export const updateNotificationSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { subscription, userId } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }

    // encrypt the token
    const { data, iv } = encryptText(subscription.expoPushToken);
    const notificationSubscr = {
      isActive: subscription.isActive,
      schedule: subscription.schedule,
      token: {
        data,
        iv,
      },
    };

    // update the existing subscription
    user.notificationSubscr = notificationSubscr;
    await user.save();

    res.status(200).json({
      data: { success: true },
    });
  } catch (err) {
    logger.r('updateNotificationSubscription', err);
    return next(new HttpError('Unable to update subscription', 500));
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
    if (user.notificationSubscr === null) {
      return next(new HttpError('No subscription exists', 404));
    }

    user.notificationSubscr.schedule = schedule;
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
    if (user.notificationSubscr === null) {
      return next(new HttpError('No subscription exists', 404));
    }

    // update user data
    user.notificationSubscr.schedule = null;
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

    const subscription = user.notificationSubscr;

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
