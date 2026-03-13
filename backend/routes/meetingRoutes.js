const express = require('express');
const router = express.Router();
const { logMeeting, endMeeting, getMeetings } = require('../controllers/meetingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/start', logMeeting);
router.post('/end', endMeeting);
router.get('/', getMeetings);

module.exports = router;
