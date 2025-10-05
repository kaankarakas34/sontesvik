const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getPendingUsers,
  approveUser,
  rejectUser,
  getApprovalStatus
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validateEmail, 
  validatePassword,
  validateJsonData 
} = require('../middleware/inputValidation');

const router = express.Router();

// Public routes - with enhanced validation
router.post('/register', validateUserRegistration, validateJsonData, register);
router.post('/login', validateUserLogin, validateJsonData, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateEmail, validateJsonData, forgotPassword);
router.post('/reset-password', validatePassword, validateJsonData, resetPassword);

// Protected routes
router.use(protect); // All routes below this middleware are protected

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', validatePassword, validateJsonData, changePassword);
router.get('/approval-status', getApprovalStatus);

// Admin only routes
router.get('/pending-users', adminOnly, getPendingUsers);
router.put('/approve-user/:id', adminOnly, approveUser);
router.put('/reject-user/:id', adminOnly, rejectUser);

module.exports = router;