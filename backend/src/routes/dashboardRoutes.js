const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// All routes - No authentication required for now
router.get('/stats', getDashboardStats);

module.exports = router;
