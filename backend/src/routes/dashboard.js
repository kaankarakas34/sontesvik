const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getConsultantDashboardStats,
  getMemberDashboardStats,
  getDashboardData,
  getRecentActivities
} = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dashboard API is working' });
});

// Get dashboard data based on user role
router.get('/', authenticate, getDashboardData);

// Get recent activities
router.get('/activities', authenticate, getRecentActivities);

// Role-specific dashboard endpoints
router.get('/admin', authenticate, authorize(['admin']), getAdminDashboardStats);
router.get('/consultant', authenticate, authorize(['consultant']), getConsultantDashboardStats);
router.get('/member', authenticate, authorize(['member']), getMemberDashboardStats);

module.exports = router;