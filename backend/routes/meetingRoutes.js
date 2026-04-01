import express from 'express';
import * as meetingController from '../controllers/meetingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// POST Create meeting (Manager)
router.post('/', meetingController.createMeeting);

// GET Manager created meetings
router.get('/manager', meetingController.getManagerMeetings);

// GET Employee assigned meetings
router.get('/employee', meetingController.getEmployeeMeetings);

export default router;
