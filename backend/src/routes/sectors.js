const express = require('express');
const {
  getSectors,
  getSectorsWithIncentives,
  getSectorById,
  getSectorWithIncentives,
  createSector,
  createSectorWithIncentives,
  updateSector,
  updateSectorWithIncentives,
  updateSectorIncentives,
  deleteSector,
  getSectorTree
} = require('../controllers/sectorController');
const { protect, authorize } = require('../middleware/auth');
const { validateSector } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getSectors);
router.get('/with-incentives', getSectorsWithIncentives);
router.get('/tree', getSectorTree);
router.get('/:id', getSectorById);
router.get('/:id/with-incentives', getSectorWithIncentives);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', validateSector, createSector);
router.post('/with-incentives', validateSector, createSectorWithIncentives);
router.put('/:id', validateSector, updateSector);
router.put('/:id/with-incentives', validateSector, updateSectorWithIncentives);
router.put('/:id/incentives', updateSectorIncentives);
router.delete('/:id', deleteSector);

module.exports = router;