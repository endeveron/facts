import { Router } from 'express';
import { body } from 'express-validator';

import {
  getFacts,
  postFact,
  resetStatistics,
  dev,
} from '../controllers/fact.js';
import { checkAuth } from '../middleware/check-auth.js';
import { handleHttpError } from '../utils/error.js';

const router = Router();

router.get('/dev', dev);

router.use(checkAuth);

router.get('/:userId', getFacts);
router.get('/reset-statistics/:userId', resetStatistics);
router.post(
  '/',
  [body('title').isLength({ min: 10, max: 100 }), body('category').notEmpty()],
  postFact
);

router.use(handleHttpError);

export default router;
