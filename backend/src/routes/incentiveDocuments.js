const express = require('express');
const {
  getIncentiveDocuments,
  getIncentiveDocumentById,
  getDocumentsByIncentiveId,
  createIncentiveDocument,
  updateIncentiveDocument,
  deleteIncentiveDocument,
  batchCreateIncentiveDocuments
} = require('../controllers/incentiveDocumentController');
const { protect, authorize } = require('../middleware/auth');
const { validateIncentiveDocument, validateBatchIncentiveDocuments } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getIncentiveDocuments);
router.get('/:id', getIncentiveDocumentById);
router.get('/incentive/:incentiveId', getDocumentsByIncentiveId);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', validateIncentiveDocument, createIncentiveDocument);
router.post('/batch', validateBatchIncentiveDocuments, batchCreateIncentiveDocuments);
router.put('/:id', validateIncentiveDocument, updateIncentiveDocument);
router.delete('/:id', deleteIncentiveDocument);

module.exports = router;