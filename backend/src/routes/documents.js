const express = require('express');
const router = express.Router();
const { getMyDocumentsForIncentive } = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth');

// Protected route to get user-specific documents for an incentive
router.get('/my-documents/incentive/:incentiveId', authenticateToken, getMyDocumentsForIncentive);

module.exports = router;