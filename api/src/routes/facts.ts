import { Router } from 'express';
import { body } from 'express-validator';

import {
  getDataToInitLocalDb,
  getFacts,
  getFactsForLocalDbStorage,
  postFact,
} from '../controllers/facts';
import { handleHttpError } from '../helpers/error';
import { checkAuth } from '../middleware/check-auth';

const router = Router();
router.use(checkAuth);

router.get('/init-db', getDataToInitLocalDb);
router.get('/storage', getFactsForLocalDbStorage);
router.get('/', getFacts);
router.post(
  '/',
  [body('title').isLength({ min: 10, max: 100 }), body('category').notEmpty()],
  postFact
);

router.use(handleHttpError);

export default router;
