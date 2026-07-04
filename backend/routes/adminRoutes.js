const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', authenticateToken, adminController.getDashboardStats);

module.exports = router;