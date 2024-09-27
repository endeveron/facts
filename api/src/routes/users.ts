import { Router } from 'express';
import { body } from 'express-validator';

import {
  getFavorites,
  resetFacts,
  evaluateFact,
  getNotificationsSubscriptionStatus,
  createNotificationsSubscription,
} from '../controllers/users.js';
import { checkAuth } from '../middleware/check-auth.js';
import { handleHttpError } from '../helpers/error.js';

const router = Router();

// TODO: move NS to protected routes section
router.get(
  '/:userId/notifications-subscription-status',
  getNotificationsSubscriptionStatus
);
router.post(
  '/notifications-subscription',
  body('expoPushToken').notEmpty(),
  body('userId').isLength({ min: 24, max: 24 }),
  createNotificationsSubscription
);

router.use(checkAuth);

router.get('/:userId/favorites', getFavorites);
router.get('/:userId/reset-facts', resetFacts);

router.post(
  '/evaluate-fact',
  body('factId').isLength({ min: 24, max: 24 }),
  body('userId').isLength({ min: 24, max: 24 }),
  evaluateFact
);

// move NS here

router.use(handleHttpError);

export default router;
