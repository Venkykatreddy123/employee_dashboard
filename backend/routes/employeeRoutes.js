const express = require('express');
const router = express.Router();
const { addEmployee, updateEmployee, deleteEmployee, getAllEmployees, getEmployeeById } = require('../controllers/employeeController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', authorize(['Admin', 'HR', 'Manager']), getAllEmployees);
router.get('/:id', authorize(['Admin', 'HR', 'Manager']), getEmployeeById);
router.post('/', authorize(['Admin', 'HR']), addEmployee);
router.put('/:id', authorize(['Admin', 'HR']), updateEmployee);
router.delete('/:id', authorize(['Admin']), deleteEmployee);

module.exports = router;
