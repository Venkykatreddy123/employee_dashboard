const express = require('express');
const router = express.Router();
const bonusController = require('../controllers/bonusController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Historical records
router.get('/', bonusController.getBonuses);

// Authority-driven assignment
router.post('/', authorize(['Admin', 'HR']), bonusController.assignBonus);

module.exports = router;
