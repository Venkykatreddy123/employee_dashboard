const express = require('express');
const router = express.Router();
const { login, getMe, register, getUsers } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/users', authMiddleware, getUsers);
router.get('/me', authMiddleware, getMe);

module.exports = router;
