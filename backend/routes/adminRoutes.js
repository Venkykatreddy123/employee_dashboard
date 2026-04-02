const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const { 
    createUser, 
    updateUser, 
    deleteUser, 
    getAllData, 
    getUsers, 
    getLogs, 
    getSettings, 
    getActiveSessions,
    updateSetting,
    updateUserRole,
    backupData
} = require('../controllers/adminController');

// All admin routes require authentication & strict 'Admin' role
router.use(authMiddleware);
router.use(authorize(['Admin']));

// Identity & Infrastructure Dashboards
router.get('/users', getUsers);
router.get('/logs', getLogs);
router.get('/settings', getSettings);
router.get('/active-sessions', getActiveSessions);
router.get('/all-data', getAllData);

// Critical Operations
router.post('/user-role', updateUserRole);
router.post('/settings', updateSetting);
router.post('/backup', backupData);

// User CRUD Lifecycle
router.post('/register', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
