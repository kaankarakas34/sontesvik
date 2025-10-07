const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getApplications,
  getMyApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  uploadApplicationDocument,
  getApplicationDocuments,
  deleteApplicationDocument,
  downloadApplicationDocument
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { validateApplication } = require('../middleware/validation');
const { validatePagination, validateId } = require('../middleware/inputValidation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/applications');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types with enhanced security
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ];

  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, Word, Excel, JPEG, and PNG files are allowed.'), false);
  }

  // Check file extension
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Invalid file extension. Only PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, and PNG files are allowed.'), false);
  }

  // Check for suspicious file names
  const suspiciousPatterns = /[<>\"'%;()&+]/;
  if (suspiciousPatterns.test(file.originalname)) {
    return cb(new Error('File name contains invalid characters.'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Apply authentication to all routes
router.use(protect);

// Application CRUD routes - with enhanced validation
router.get('/', validatePagination, getApplications);
router.get('/my', validatePagination, getMyApplications);
router.get('/:id', validateId, getApplicationById);
router.post('/', validateApplication, createApplication);
router.put('/:id', validateId, validateApplication, updateApplication);
router.delete('/:id', validateId, authorize('admin'), deleteApplication);

// Document management routes
router.get('/:id/documents', getApplicationDocuments);
router.post('/:id/documents', upload.single('document'), uploadApplicationDocument);
router.delete('/:id/documents/:documentId', deleteApplicationDocument);
router.get('/:id/documents/:documentId/download', downloadApplicationDocument);

module.exports = router;