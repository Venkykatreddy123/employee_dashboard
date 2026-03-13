const express = require('express');
const router = express.Router();
const { startBreak, endBreak, getBreaks } = require('../controllers/breakController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/start', startBreak);
router.post('/end', endBreak);
router.get('/', getBreaks);

module.exports = router;
