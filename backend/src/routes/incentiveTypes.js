const express = require('express');
const {
  getIncentiveTypes,
  getIncentiveTypeById,
  createIncentiveType,
  updateIncentiveType,
  deleteIncentiveType,
  toggleIncentiveTypeStatus
} = require('../controllers/incentiveTypeController');
const { protect, authorize } = require('../middleware/auth');
const { validateIncentiveType } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getIncentiveTypes);
router.get('/:id', getIncentiveTypeById);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', validateIncentiveType, createIncentiveType);
router.put('/:id', validateIncentiveType, updateIncentiveType);
router.patch('/:id/toggle-status', toggleIncentiveTypeStatus);
router.delete('/:id', deleteIncentiveType);

module.exports = router;