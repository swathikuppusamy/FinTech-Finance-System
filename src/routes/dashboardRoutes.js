const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// Dashboard is accessible to analysts and admins
router.use(authenticate, authorize('analyst', 'admin'));

router.get('/summary', dashboardController.getSummary);
router.get('/trends', dashboardController.getMonthlyTrends);
router.get('/categories', dashboardController.getCategoryBreakdown);
router.get('/recent', dashboardController.getRecentActivity);

module.exports = router;
