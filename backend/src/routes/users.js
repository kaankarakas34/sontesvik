const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserStatus,
  getPendingUsers,
  bulkApproveUsers,
  getCompanies,
  getCompanyDetails,
  createCompany
} = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', requireRole(['admin']), getAllUsers);
router.post('/', requireRole(['admin']), createUser);
router.get('/stats', requireRole(['admin']), getUserStats);
router.get('/pending', requireRole(['admin']), getPendingUsers);
router.get('/companies', requireRole(['admin']), getCompanies);
router.post('/companies', requireRole(['admin']), createCompany); // New company creation endpoint
router.get('/companies/:companyName', requireRole(['admin']), getCompanyDetails);
router.get('/:id', requireRole(['admin']), getUserById);
router.put('/:id', requireRole(['admin']), updateUser);
router.put('/:id/status', requireRole(['admin']), updateUserStatus);
router.post('/bulk-approve', requireRole(['admin']), bulkApproveUsers);
router.delete('/:id', requireRole(['admin']), deleteUser);

module.exports = router;