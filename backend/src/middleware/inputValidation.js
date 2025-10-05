const { body, param, query, validationResult } = require('express-validator');

// Custom validator for preventing SQL injection patterns
const preventSqlInjection = (value) => {
  if (typeof value !== 'string') return true;
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|truncate)\b|--|\/\*|\*\/)/gi,
    /(\b(or|and)\b.*=.*\b(or|and)\b)/gi,
    /(['"];?\s*(drop|delete|truncate|update|insert|select)\s+)/gi
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(value));
};

// Custom validator for preventing NoSQL injection
const preventNoSqlInjection = (value) => {
  if (typeof value === 'object' && value !== null) {
    const dangerousKeys = ['$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$or', '$and', '$not', '$exists', '$regex'];
    return !dangerousKeys.some(key => key in value);
  }
  return true;
};

// Enhanced validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errorMessages
      }
    });
  }

  next();
};

// Enhanced user registration validation
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .custom(preventSqlInjection)
    .withMessage('First name contains invalid characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .custom(preventSqlInjection)
    .withMessage('Last name contains invalid characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters')
    .custom(preventSqlInjection)
    .withMessage('Email contains invalid characters'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
    .custom(preventSqlInjection)
    .withMessage('Password contains invalid characters'),
  
  body('role')
    .isIn(['member', 'consultant', 'admin'])
    .withMessage('Role must be member, consultant, or admin')
    .custom(preventSqlInjection)
    .withMessage('Role contains invalid characters'),
  
  body('sector')
    .optional()
    .isIn([
      'technology', 'manufacturing', 'agriculture', 'tourism', 'healthcare',
      'education', 'finance', 'construction', 'energy', 'textile', 'food',
      'automotive', 'logistics', 'retail', 'other'
    ])
    .withMessage('Please select a valid sector')
    .custom(preventSqlInjection)
    .withMessage('Sector contains invalid characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('tr-TR')
    .withMessage('Please provide a valid Turkish phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters')
    .custom(preventSqlInjection)
    .withMessage('Phone number contains invalid characters'),
  
  body('companyName')
    .optional()
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters')
    .custom(preventSqlInjection)
    .withMessage('Company name contains invalid characters'),
  
  body('taxNumber')
    .optional()
    .isLength({ min: 10, max: 11 })
    .withMessage('Tax number must be 10 or 11 digits')
    .isNumeric()
    .withMessage('Tax number must contain only numbers')
    .custom(preventSqlInjection)
    .withMessage('Tax number contains invalid characters'),
  
  validate
];

// Enhanced login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters')
    .custom(preventSqlInjection)
    .withMessage('Email contains invalid characters'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must not exceed 128 characters')
    .custom(preventSqlInjection)
    .withMessage('Password contains invalid characters'),
  
  validate
];

// Enhanced pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('sortBy')
    .optional()
    .isAlphanumeric()
    .withMessage('Sort by must be alphanumeric')
    .custom(preventSqlInjection)
    .withMessage('Sort by contains invalid characters'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
    .custom(preventSqlInjection)
    .withMessage('Sort order contains invalid characters'),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
    .custom(preventSqlInjection)
    .withMessage('Search term contains invalid characters'),
  
  validate
];

// Enhanced ID parameter validation
const validateId = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format')
    .custom(preventSqlInjection)
    .withMessage('ID contains invalid characters'),
  
  validate
];

// Enhanced email validation
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom(preventSqlInjection)
    .withMessage('Email contains invalid characters'),
  
  validate
];

// Enhanced password validation
const validatePassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
    .custom(preventSqlInjection)
    .withMessage('Password contains invalid characters'),
  
  validate
];

// Enhanced NoSQL injection prevention for JSON data
const validateJsonData = [
  body()
    .custom(preventNoSqlInjection)
    .withMessage('Request body contains invalid operators'),
  
  validate
];

module.exports = {
  validate,
  preventSqlInjection,
  preventNoSqlInjection,
  validateUserRegistration,
  validateUserLogin,
  validatePagination,
  validateId,
  validateEmail,
  validatePassword,
  validateJsonData
};