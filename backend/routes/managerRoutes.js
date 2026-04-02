const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { getTeam, getTeamData, approveLeave, rejectLeave, getUserProfile } = require('../controllers/managerController');

// All manager routes require authentication & Manager+ role
router.use(authMiddleware);
router.use(authorize(['Manager', 'Admin'])); // Admins inherently have manager rights

// Team Details
router.get('/team', getTeam);
router.get('/team-data', getTeamData);
router.get('/user-profile/:id', getUserProfile);

// Leave Approval Workflow
router.put('/leave/:id/approve', approveLeave);
router.put('/leave/:id/reject', rejectLeave);

module.exports = router;
