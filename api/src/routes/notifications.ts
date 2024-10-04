import { Router } from 'express';
import { body } from 'express-validator';

import {
  createNotificationSubscription,
  sendNotification,
  createNotificationSchedule,
  deleteNotificationSchedule,
} from '../controllers/notifications.js';
import { handleHttpError } from '../helpers/error.js';
import { checkAuth } from '../middleware/check-auth.js';

const router = Router();
router.use(checkAuth);

router.post(
  '/subscription',
  body('expoPushToken').notEmpty(),
  body('userId').isLength({ min: 24, max: 24 }),
  createNotificationSubscription
);
router.post(
  '/schedule',
  body('schedule').notEmpty(),
  body('userId').isLength({ min: 24, max: 24 }),
  createNotificationSchedule
);
router.post(
  '/delete-schedule',
  body('schedule').notEmpty(),
  body('userId').isLength({ min: 24, max: 24 }),
  deleteNotificationSchedule
);
router.post(
  '/send',
  body('userId').isLength({ min: 24, max: 24 }),
  sendNotification
);

router.use(handleHttpError);

export default router;
