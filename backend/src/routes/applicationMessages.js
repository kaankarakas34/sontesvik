const express = require('express');
const router = express.Router();
const {
  getApplicationMessages,
  sendMessage,
  replyToMessage,
  getUnreadMessages,
  markMessageAsRead,
  updateMessageStatus,
  getMessageThread,
  getUserMessages
} = require('../controllers/applicationMessageController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// User's inbox and message management
router.get('/inbox', getUserMessages);
router.get('/unread', getUnreadMessages);

// Message thread operations
router.get('/thread/:messageId', getMessageThread);
router.patch('/:messageId/read', markMessageAsRead);
router.patch('/:messageId/status', updateMessageStatus);
router.post('/:messageId/reply', replyToMessage);

// Application-specific message operations
router.get('/application/:applicationId', getApplicationMessages);
router.post('/application/:applicationId', sendMessage);

module.exports = router;