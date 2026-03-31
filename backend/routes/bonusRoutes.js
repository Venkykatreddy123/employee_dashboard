import express from 'express';
import * as bonusController from '../controllers/bonusController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', bonusController.getBonuses);
router.post('/', roleMiddleware(['admin', 'manager']), bonusController.assignBonus);

export default router;
