import { Router } from 'express';
import { body } from 'express-validator';

import { getFacts, postFact } from '../controllers/facts.js';
import { checkAuth } from '../middleware/check-auth.js';
import { handleHttpError } from '../helpers/error.js';

const router = Router();
router.use(checkAuth);

router.get('/:category/:userId', getFacts);
router.post(
  '/',
  [body('title').isLength({ min: 10, max: 100 }), body('category').notEmpty()],
  postFact
);

router.use(handleHttpError);

export default router;
