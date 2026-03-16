const express = require('express');
const router = express.Router();
const { exportCSV, exportPDF } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/csv/:type', exportCSV);
router.get('/pdf/:type', exportPDF);

module.exports = router;
