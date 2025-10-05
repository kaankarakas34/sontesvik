const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errorMessages
      }
    });
  }

  next();
};

// Sector validation
const validateSector = [
  body('name')
    .notEmpty()
    .withMessage('Sector name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Sector name must be between 2 and 100 characters'),
  body('nameEn')
    .optional()
    .isLength({ max: 100 })
    .withMessage('English name must not exceed 100 characters'),
  body('code')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Code must not exceed 20 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('level')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Level must be between 1 and 5'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
];

// Incentive Type validation
const validateIncentiveType = [
  body('name')
    .notEmpty()
    .withMessage('Incentive type name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('nameEn')
    .optional()
    .isLength({ max: 100 })
    .withMessage('English name must not exceed 100 characters'),
  body('code')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Code must not exceed 20 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
];

// Document Type validation
const validateDocumentType = [
  body('name')
    .notEmpty()
    .withMessage('Document type name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('nameEn')
    .optional()
    .isLength({ max: 100 })
    .withMessage('English name must not exceed 100 characters'),
  body('code')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Code must not exceed 20 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean'),
  body('maxFileSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max file size must be a positive integer'),
  body('allowedMimeTypes')
    .optional()
    .isArray()
    .withMessage('Allowed mime types must be an array'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
];

// IncentiveDocument validation
const validateIncentiveDocument = [
  body('incentiveId')
    .notEmpty()
    .withMessage('Incentive ID is required')
    .isUUID()
    .withMessage('Invalid incentive ID format'),
  body('documentTypeId')
    .notEmpty()
    .withMessage('Document type ID is required')
    .isUUID()
    .withMessage('Invalid document type ID format'),
  body('isRequired')
    .optional()
    .isBoolean()
    .withMessage('isRequired must be a boolean value'),
  validate
];

// Batch IncentiveDocument validation
const validateBatchIncentiveDocuments = [
  body('incentiveId')
    .notEmpty()
    .withMessage('Incentive ID is required')
    .isUUID()
    .withMessage('Invalid incentive ID format'),
  body('documentTypeIds')
    .notEmpty()
    .withMessage('Document type IDs are required')
    .isArray()
    .withMessage('Document type IDs must be an array')
    .custom(value => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('At least one document type ID is required');
      }
      return true;
    }),
  validate
];

// Application validation
const validateApplication = [
  body('applicationNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Application number must not exceed 50 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'submitted', 'under_review', 'additional_info_required', 'approved', 'rejected', 'cancelled', 'completed'])
    .withMessage('Invalid application status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('requestedAmount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Requested amount must be a valid decimal'),
  body('approvedAmount')
    .optional()
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Approved amount must be a valid decimal'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
  body('projectTitle')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Project title must not exceed 200 characters'),
  body('projectDescription')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('Project description must not exceed 5000 characters'),
  validate
];

module.exports = {
  validate,
  validateSector,
  validateIncentiveType,
  validateDocumentType,
  validateIncentiveDocument,
  validateBatchIncentiveDocuments,
  validateApplication
};