const express = require('express');
const router = express.Router();

// Import Route Modules
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const employeeRoutes = require('./employeeRoutes');
const leaveRoutes = require('./leaveRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const bonusRoutes = require('./bonusRoutes');
const adminRoutes = require('./adminRoutes');

// Import Controllers for catch-all items from the old routes.js
const adminController = require('../controllers/adminController');
const meetingController = require('../controllers/meetingController');
const projectController = require('../controllers/projectController');
const notificationController = require('../controllers/notificationController');
const userController = require('../controllers/userController');
const sessionController = require('../controllers/sessionController');

// Middleware
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const adminOnly = [authMiddleware, roleMiddleware(['admin', 'Admin'])];
const managerOrAdmin = [authMiddleware, roleMiddleware(['admin', 'Admin', 'manager', 'Manager'])];

// 🚀 Mount Domain Specific Routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees', employeeRoutes);
router.use('/leaves', leaveRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/bonuses', bonusRoutes);
router.use('/admin', adminRoutes);

// 🔔 Notifications
router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/notifications/read-all', authMiddleware, notificationController.markAllAsRead);

// 🛡️ Admin & Manager Projects
router.post('/projects', managerOrAdmin, projectController.createProject);
router.get('/projects/manager', managerOrAdmin, projectController.getManagerProjects);
router.get('/projects/employee', authMiddleware, projectController.getEmployeeProjects);
router.delete('/projects/:id', managerOrAdmin, projectController.deleteProject);

// ⏱️ Work Sessions
router.post('/work-session/start', authMiddleware, sessionController.startSession);
router.post('/work-session/stop', authMiddleware, sessionController.stopSession);
router.get('/work-session/status', authMiddleware, sessionController.getStatus);

// 🤝 Meetings
router.post('/meetings', managerOrAdmin, meetingController.createMeeting);
router.get('/meetings/employee', authMiddleware, meetingController.getEmployeeMeetings);


module.exports = router;
