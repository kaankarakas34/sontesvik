const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAvailableIncentives,
  createApplicationWithIncentives,
  getApplicationIncentives,
  addIncentivesToApplication
} = require('../controllers/incentiveSelectionController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get available incentives for selection
router.get('/incentives', getAvailableIncentives);

// Create application with selected incentives
router.post('/applications/with-incentives', createApplicationWithIncentives);

// Get application with its incentives
router.get('/applications/:id/incentives', getApplicationIncentives);

// Add incentives to existing application
router.post('/applications/:id/incentives', addIncentivesToApplication);

module.exports = router;