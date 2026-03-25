import express from 'express';
import * as meetingController from '../controllers/meetingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', meetingController.getMeetings);
router.post('/', meetingController.createMeeting);

export default router;
