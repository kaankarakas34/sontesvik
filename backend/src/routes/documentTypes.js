const express = require('express');
const {
  getDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  toggleDocumentTypeStatus,
  toggleDocumentTypeRequired
} = require('../controllers/documentTypeController');
const { protect, authorize } = require('../middleware/auth');
const { validateDocumentType } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getDocumentTypes);
router.get('/:id', getDocumentTypeById);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', validateDocumentType, createDocumentType);
router.put('/:id', validateDocumentType, updateDocumentType);
router.patch('/:id/toggle-status', toggleDocumentTypeStatus);
router.patch('/:id/toggle-required', toggleDocumentTypeRequired);
router.delete('/:id', deleteDocumentType);

module.exports = router;