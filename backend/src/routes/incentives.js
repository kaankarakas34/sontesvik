const express = require('express');
const router = express.Router();
const {
  getIncentivesBySector,
  getIncentives,
  getIncentiveById,
  createIncentive,
  updateIncentive,
  deleteIncentive
} = require('../controllers/incentiveController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getIncentives);
router.get('/:id', getIncentiveById);

// Protected routes (authentication required)
router.use(authenticateToken);

// User routes
router.get('/by-sector/list', getIncentivesBySector);

// Admin only routes
router.post('/', requireRole(['admin']), createIncentive);
router.put('/:id', requireRole(['admin']), updateIncentive);
router.delete('/:id', requireRole(['admin']), deleteIncentive);

module.exports = router;