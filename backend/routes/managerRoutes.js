const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getTeam, getTeamData, approveLeave, rejectLeave, getUserProfile } = require('../controllers/managerController');
const { getTeamPayslips } = require('../controllers/payslipController');

// All manager routes require authentication
router.use(verifyToken);

// Roles middleware helper
const isManager = authorizeRoles('Manager', 'Admin');


// Team Details
router.get('/team', isManager, getTeam);
router.get('/team-data', isManager, getTeamData);
router.get('/user-profile/:id', isManager, getUserProfile);

// Financial Management
router.get('/team-payslips', isManager, getTeamPayslips);

// Leave Approval Workflow
router.put('/leave/:id/approve', isManager, approveLeave);
router.put('/leave/:id/reject', isManager, rejectLeave);


module.exports = router;
