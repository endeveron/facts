import { Router } from 'express';
import { body } from 'express-validator';

import {
  getFavourites,
  postEvaluateFact,
  getResetFacts,
} from '../controllers/users.js';
import { checkAuth } from '../middleware/check-auth.js';
import { handleHttpError } from '../utils/error.js';

const router = Router();

router.use(checkAuth);

router.get('/:userId/favourites', getFavourites);
router.get('/:userId/reset-facts', getResetFacts);
router.post(
  '/evaluate-fact',
  body('factId').isLength({ min: 24, max: 24 }),
  body('userId').isLength({ min: 24, max: 24 }),
  postEvaluateFact
);

router.use(handleHttpError);

export default router;
