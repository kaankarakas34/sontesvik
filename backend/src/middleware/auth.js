const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - JWT authentication
const protect = async (req, res, next) => {
  try {
    let token;

    console.log('Auth middleware called - Headers:', req.headers.authorization);

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('Extracted token:', token);

    // Make sure token exists
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        error: { message: 'Not authorized to access this route' }
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      
      // Get user from token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      console.log('User found:', user ? `${user.id} - ${user.role}` : 'null');

      if (!user) {
        console.log('User not found in database');
        return res.status(401).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        console.log('User status is not active:', user.status);
        return res.status(401).json({
          success: false,
          error: { message: 'User account is not active' }
        });
      }

      req.user = user;
      console.log('Authentication successful for user:', user.id);
      next();
    } catch (error) {
      console.log('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        error: { message: 'Not authorized to access this route' }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Dummy change to trigger nodemon restart
// Grant access to specific roles
const authorize = (roles) => {
  return (req, res, next) => {
    console.log('Authorization check:', {
      userRole: req.user?.role,
      allowedRoles: roles,
      userId: req.user?.id
    });
    
    if (!roles.includes(req.user.role)) {
      console.log('Authorization failed:', {
        userRole: req.user.role,
        allowedRoles: roles,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
      return res.status(403).json({
        success: false,
        error: { message: `User role ${req.user.role} is not authorized to access this route` }
      });
    }
    
    console.log('Authorization successful for user:', req.user.id, 'with role:', req.user.role);
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        
        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Invalid token in optional auth:', error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Admin only access
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied. Admin privileges required.' }
    });
  }
  next();
};

// Alias for protect function
const authenticateToken = protect;

// Alias for adminOnly function
const requireAdmin = adminOnly;

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: `Access denied. Required roles: ${roles.join(', ')}` }
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  authenticate: protect, // Alias for protect
  authenticateToken,
  authorize,
  optionalAuth,
  adminOnly,
  requireAdmin,
  requireRole
};