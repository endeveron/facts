import { Router } from 'express';
import { body } from 'express-validator';

import { postEvaluateFact } from '../controllers/users.js';
// import { getUser } from '../controllers/users.js';
import { checkAuth } from '../middleware/check-auth.js';
import { handleHttpError } from '../utils/error.js';

const router = Router();

router.use(checkAuth);

// router.get('/:id', getUser);
router.post(
  '/evaluate-fact',
  body('factId').isLength({ min: 24, max: 24 }),
  body('userId').isLength({ min: 24, max: 24 }),
  postEvaluateFact
);

router.use(handleHttpError);

export default router;
