const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const ConsultantController = require('../controllers/consultantController');

const router = express.Router();

// Tüm route'lar için authentication middleware'ı
router.use(protect);

// Danışman Dashboard Routes
router.get('/dashboard', ConsultantController.getConsultantDashboard);
router.get('/applications', ConsultantController.getAssignedApplications);
router.get('/applications/:applicationId', ConsultantController.getApplicationDetails);
router.put('/applications/:applicationId/status', ConsultantController.updateApplicationStatus);

// Danışman Performans Routes
router.get('/performance/:consultantId', ConsultantController.getConsultantPerformance);

// Admin Routes
router.get('/all', authorize('admin'), ConsultantController.getAllConsultants);
router.post('/create', authorize('admin'), ConsultantController.createConsultant);

module.exports = router;