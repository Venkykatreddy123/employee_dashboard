const express = require('express');
const router = express.Router();
const { 
    createProject, getAllProjects, updateProject, deleteProject, getProjectsByEmployee 
} = require('../controllers/projectController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Global portfolio fetch (Admin-level tiers)
router.get('/', authorize(['Admin', 'Manager', 'HR']), getAllProjects);

// Multi-tier access for individual project lists
router.get('/employee/:id', authorize(['Employee', 'Admin', 'Manager', 'HR']), getProjectsByEmployee);

router.post('/', authorize(['Admin', 'Manager']), createProject);
router.put('/:id', authorize(['Admin', 'Manager']), updateProject);
router.delete('/:id', authorize(['Admin', 'Manager']), deleteProject);

module.exports = router;
