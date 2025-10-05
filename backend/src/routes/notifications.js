const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationStats,
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/notifications/my - Get current user's notifications
router.get('/my', getUserNotifications);

// GET /api/notifications/unread - Get current user's unread notifications
router.get('/unread', getUnreadNotifications);

// GET /api/notifications/unread/count - Get unread notification count
router.get('/unread/count', getUnreadCount);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', markAsRead);

// GET /api/notifications - Get all notifications with pagination and filtering (Admin only)
router.get('/', requireAdmin, getNotifications);

// GET /api/notifications/stats - Get notification statistics (Admin only)
router.get('/stats', requireAdmin, getNotificationStats);

// GET /api/notifications/:id - Get notification by ID (Admin only)
router.get('/:id', requireAdmin, getNotificationById);

// POST /api/notifications - Create new notification (Admin only)
router.post('/', requireAdmin, createNotification);

// PUT /api/notifications/:id - Update notification (Admin only)
router.put('/:id', requireAdmin, updateNotification);

// DELETE /api/notifications/:id - Delete notification (Admin only)
router.delete('/:id', requireAdmin, deleteNotification);

module.exports = router;