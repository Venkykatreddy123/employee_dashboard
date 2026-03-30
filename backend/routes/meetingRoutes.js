const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Ensure token-based identity is validated for all meeting traffic
router.use(authMiddleware);

// Endpoint strategy mapping
router.get('/', meetingController.getMeetings);
router.post('/', meetingController.createMeeting);

module.exports = router;
