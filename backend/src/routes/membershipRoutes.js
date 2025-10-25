const express = require('express');
const router = express.Router();
const {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
  getMembershipStats,
  getMembershipsByCompany
} = require('../controllers/membershipController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['admin']));

// GET /api/memberships/stats - Get membership statistics
router.get('/stats', getMembershipStats);

// GET /api/memberships/company/:companyId - Get memberships by company
router.get('/company/:companyId', getMembershipsByCompany);

// GET /api/memberships - Get all memberships with pagination and filters
router.get('/', getAllMemberships);

// GET /api/memberships/:id - Get membership by ID
router.get('/:id', getMembershipById);

// POST /api/memberships - Create new membership
router.post('/', createMembership);

// PUT /api/memberships/:id - Update membership
router.put('/:id', updateMembership);

// DELETE /api/memberships/:id - Delete membership
router.delete('/:id', deleteMembership);

module.exports = router;