const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Sector } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      companyName,
      companyTaxNumber,
      taxOffice,
      billingAddress,
      address,
      city,
      sector
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User with this email already exists' }
      });
    }

    // Validate sector for all roles (except admin)
    if (role !== 'admin' && !sector) {
      return res.status(400).json({
        success: false,
        error: { message: 'Sector selection is required' }
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      companyName,
      companyTaxNumber,
      taxOffice,
      billingAddress,
      address,
      city,
      sector,
      status: role === 'admin' ? 'active' : 'pending' // Admin is active, others need approval
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    console.log('🔍 Debug - Login request received');
    console.log('🔍 Debug - Request body:', req.body);
    console.log('🔍 Debug - Request headers:', req.headers);
    
    const { email, password } = req.body;

    // Find user by email with sector information
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] },
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['id', 'name', 'code', 'description', 'isActive']
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        error: { 
          message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' 
        }
      });
    }

    // Check password
    console.log('🔍 Debug - Email:', email);
    console.log('🔍 Debug - Password from request:', password);
    console.log('🔍 Debug - User found:', !!user);
    console.log('🔍 Debug - User password hash:', user.password ? user.password.substring(0, 20) + '...' : 'No password');
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔍 Debug - Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      let message;
      switch (user.status) {
        case 'pending':
          message = user.role === 'admin' 
            ? 'Please verify your email address before logging in'
            : 'Your account is pending admin approval. Please wait for approval.';
          break;
        case 'suspended':
          message = 'Your account has been suspended. Please contact support.';
          break;
        default:
          message = 'Your account is not active. Please contact support.';
      }
      return res.status(401).json({
        success: false,
        error: { message },
        userStatus: user.status
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    await user.update({ refreshToken });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Respond with unified payload expected by frontend/mobile clients
    res.json({
      success: true,
      message: 'Login successful',
      user: user.toJSON(),
      token: accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '48h'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // Invalidate current session
    await req.user.invalidateSession();
    
    // Clear refresh token from database
    await req.user.update({ refreshToken: null });

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    // Log logout event
    logger.info('User logged out', {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error', {
      userId: req.user?.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    // Cookie'den veya body'den refresh token al
    const cookieToken = req.cookies?.refreshToken;
    const bodyToken = req.body?.refreshToken;
    
    const refreshToken = cookieToken || bodyToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Refresh token not provided' }
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user with this refresh token
    const user = await User.findOne({
      where: {
        id: decoded.id,
        refreshToken: refreshToken,
        status: 'active'
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in database
    await user.update({ refreshToken: newRefreshToken });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: process.env.JWT_EXPIRE || '48h'
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const { User, Sector } = require('../models');
    
    // Get user with sector information
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Sector,
        as: 'sector',
        attributes: ['id', 'name', 'code', 'description', 'isActive']
      }],
      attributes: {
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken']
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      companyName,
      companyTaxNumber,
      address,
      city,
      avatar
    } = req.body;

    const updatedUser = await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      phone: phone || req.user.phone,
      companyName: companyName || req.user.companyName,
      companyTaxNumber: companyTaxNumber || req.user.companyTaxNumber,
      address: address || req.user.address,
      city: city || req.user.city,
      avatar: avatar || req.user.avatar
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password is incorrect' }
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found with this email address' }
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send reset password email
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent. Please check your email.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hash the token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          [Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid or expired reset token' }
      });
    }

    // Update password and clear reset token
    await user.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending users for admin approval
// @route   GET /api/auth/pending-users
// @access  Private/Admin
const getPendingUsers = async (req, res, next) => {
  try {
    console.log('getPendingUsers called by user:', req.user?.id, 'role:', req.user?.role);
    
    const pendingUsers = await User.findAll({
      where: {
        status: 'pending',
        role: { [Op.in]: ['company', 'consultant'] }
      },
      attributes: {
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken']
      },
      order: [['createdAt', 'ASC']]
    });

    console.log('Found pending users:', pendingUsers.length);

    res.json({
      success: true,
      data: { users: pendingUsers },
      count: pendingUsers.length
    });
  } catch (error) {
    console.error('Error in getPendingUsers:', error);
    next(error);
  }
};

// @desc    Approve user
// @route   PUT /api/auth/approve-user/:id
// @access  Private/Admin
const approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { message: 'User is not in pending status' }
      });
    }

    await user.update({
      status: 'active',
      approvedBy: adminId,
      approvedAt: new Date()
    });

    res.json({
      success: true,
      message: 'User approved successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject user
// @route   PUT /api/auth/reject-user/:id
// @access  Private/Admin
const rejectUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: { message: 'User is not in pending status' }
      });
    }

    await user.update({
      status: 'inactive',
      rejectedBy: adminId,
      rejectedAt: new Date(),
      rejectionReason: reason || 'No reason provided'
    });

    res.json({
      success: true,
      message: 'User rejected successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user approval status
// @route   GET /api/auth/approval-status
// @access  Private
const getApprovalStatus = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'status', 'approvedAt', 'rejectedAt', 'rejectionReason']
    });

    res.json({
      success: true,
      data: { 
        status: user.status,
        approvedAt: user.approvedAt,
        rejectedAt: user.rejectedAt,
        rejectionReason: user.rejectionReason
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken: refreshAccessToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getPendingUsers,
  approveUser,
  rejectUser,
  getApprovalStatus
};