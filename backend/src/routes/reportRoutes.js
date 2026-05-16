const express = require('express');
const router = express.Router();
const { getAdminDashboardStats } = require('../controllers/reportController');

router.get('/reports/dashboard', getAdminDashboardStats);

module.exports = router;
