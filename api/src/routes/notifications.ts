import { Router } from 'express';
import { body } from 'express-validator';

import {
  getNotificationSubscription,
  createNotificationSubscription,
  sendNotification,
  createNotificationSchedule,
  deleteNotificationSchedule,
  updateNotificationSubscription,
  deleteNotificationSubscription,
} from '../controllers/notifications';
import { handleHttpError } from '../helpers/error';
import { checkAuth } from '../middleware/check-auth';

const router = Router();
router.use(checkAuth);

router.get('/subscription', getNotificationSubscription);
router.post(
  '/subscription',
  body('subscription.expoPushToken').notEmpty(),
  body('subscription.isActive').isBoolean(),
  body('subscription.schedule')
    .isLength({ min: 4, max: 4 })
    .optional({ nullable: true }),
  body('userId').isLength({ min: 24, max: 24 }),
  createNotificationSubscription
);
router.patch(
  '/subscription',
  body('subscription.expoPushToken').notEmpty(),
  body('subscription.isActive').isBoolean(),
  body('subscription.schedule')
    .isLength({ min: 4, max: 4 })
    .optional({ nullable: true }),
  body('userId').isLength({ min: 24, max: 24 }),
  updateNotificationSubscription
);
router.post(
  '/schedule',
  body('schedule').isLength({ min: 4, max: 4 }),
  body('userId').isLength({ min: 24, max: 24 }),
  createNotificationSchedule
);
router.post(
  '/delete-schedule',
  body('schedule').isLength({ min: 4, max: 4 }),
  body('userId').isLength({ min: 24, max: 24 }),
  deleteNotificationSchedule
);
router.post(
  '/send',
  body('userId').isLength({ min: 24, max: 24 }),
  sendNotification
);
router.delete('/subscription', deleteNotificationSubscription);

router.use(handleHttpError);

export default router;
