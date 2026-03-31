const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Ensure token-based identity is validated for all meeting traffic
router.use(authMiddleware);

// Endpoint strategy mapping
router.get('/', meetingController.getMeetings);
router.post('/', authorize(['Admin', 'HR', 'Manager']), meetingController.createMeeting);
router.put('/:id', authorize(['Admin', 'HR', 'Manager']), meetingController.updateMeeting);
router.delete('/:id', authorize(['Admin', 'HR', 'Manager']), meetingController.deleteMeeting);

module.exports = router;
