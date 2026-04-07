const express = require('express');
const router = express.Router();
const { requestLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, deleteLeave } = require('../controllers/leaveController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Employee submits leave
router.post('/', authorize(['Employee', 'Admin', 'Manager', 'HR']), requestLeave);

// Admin fetch all leaves
router.get('/', authorize(['Admin', 'HR']), getAllLeaves);

// Fetch my leaves (personnel lifecycle)
router.get('/my/:id', authorize(['Employee', 'Admin', 'Manager', 'HR']), getMyLeaves);

// Admin approve/reject
router.put('/:id', authorize(['Admin', 'HR']), updateLeaveStatus);

// Admin delete
router.delete('/:id', authorize(['Admin', 'HR']), deleteLeave);

module.exports = router;
