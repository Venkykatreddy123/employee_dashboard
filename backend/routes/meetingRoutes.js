const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Ensure token-based identity is validated for all meeting traffic
router.use(authMiddleware);

// Endpoint strategy mapping
router.get('/', meetingController.getMeetings);
router.get('/user/:employee_id', meetingController.getMeetings);
router.get('/:id', meetingController.getMeetingById);
router.get('/messages/:meeting_id', meetingController.getMessages);

// Privileged operations
router.post('/create', authorize(['Admin', 'HR', 'Manager']), meetingController.createMeeting);
router.patch('/status/:id', authorize(['Admin', 'HR', 'Manager']), meetingController.updateStatus);
router.delete('/:id', authorize(['Admin', 'HR', 'Manager']), meetingController.deleteMeeting);

// Common participation
router.post('/join', meetingController.joinMeeting);
router.post('/leave', meetingController.leaveMeeting);
router.post('/join-by-link/:meeting_id', meetingController.joinByLink);

module.exports = router;
