const express = require('express');
const router = express.Router();
const { assignBonus, getBonuses } = require('../controllers/bonusController');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', verifyAdmin, assignBonus); // Only admins assign
router.get('/', getBonuses);

module.exports = router;
