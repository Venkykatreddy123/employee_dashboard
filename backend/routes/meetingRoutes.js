const express = require('express');
const router = express.Router();
const { logMeeting, getMeetings } = require('../controllers/meetingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', logMeeting);
router.get('/', getMeetings);

module.exports = router;
