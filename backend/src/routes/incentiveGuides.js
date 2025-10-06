const express = require('express');
const router = express.Router();
const {
  getIncentiveGuide,
  getAllIncentiveGuides,
  createIncentiveGuide,
  updateIncentiveGuide,
  publishIncentiveGuide,
  unpublishIncentiveGuide,
  deleteIncentiveGuide,
  getIncentiveGuideById
} = require('../controllers/incentiveGuideController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', getAllIncentiveGuides);
router.get('/:id', getIncentiveGuideById);
router.get('/incentive/:incentiveId', getIncentiveGuide);

// Protected routes (authentication required)
router.use(authenticateToken);

// Admin only routes
router.post('/', requireRole(['admin']), createIncentiveGuide);
router.put('/:id', requireRole(['admin']), updateIncentiveGuide);
router.patch('/:id/publish', requireRole(['admin']), publishIncentiveGuide);
router.patch('/:id/unpublish', requireRole(['admin']), unpublishIncentiveGuide);
router.delete('/:id', requireRole(['admin']), deleteIncentiveGuide);

module.exports = router;