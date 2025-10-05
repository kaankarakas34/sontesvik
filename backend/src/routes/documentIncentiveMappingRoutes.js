const express = require('express');
const router = express.Router();
const {
  getDocumentIncentiveMappings,
  getDocumentIncentiveMappingById,
  createDocumentIncentiveMapping,
  updateDocumentIncentiveMapping,
  deleteDocumentIncentiveMapping,
  toggleDocumentIncentiveMappingStatus,
  getRequiredDocumentsForIncentive
} = require('../controllers/documentIncentiveMappingController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/incentive/:incentiveTypeId/documents', getRequiredDocumentsForIncentive);

// Protected routes - Admin only
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getDocumentIncentiveMappings)
  .post(createDocumentIncentiveMapping);

router.route('/:id')
  .get(getDocumentIncentiveMappingById)
  .put(updateDocumentIncentiveMapping)
  .delete(deleteDocumentIncentiveMapping);

router.patch('/:id/toggle-status', toggleDocumentIncentiveMappingStatus);

module.exports = router;