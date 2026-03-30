const express = require('express');
const router = express.Router();
const breakController = require('../controllers/breakController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', breakController.getBreaks);
router.post('/start', breakController.startBreak);
router.post('/end', breakController.endBreak);

module.exports = router;
