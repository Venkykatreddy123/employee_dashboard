const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeDirectory, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all employee routes

router.get('/directory', getEmployeeDirectory); // All authenticated users
router.get('/', verifyAdmin, getEmployees); // Admins only
router.post('/', verifyAdmin, addEmployee); // Admins only
router.put('/:id', verifyAdmin, updateEmployee); // Admins only
router.delete('/:id', verifyAdmin, deleteEmployee); // Admins only

module.exports = router;
