const { Document, IncentiveGuide, DocumentType, Application } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const fs = require('fs');

// Get documents uploaded by the current user for a specific incentive's requirements
const getMyDocumentsForIncentive = async (req, res) => {
  try {
    const { incentiveId } = req.params;
    const userId = req.user.id;

    if (!incentiveId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Incentive ID and User ID are required.'
      });
    }

    // Step 1: Find the incentive guide to get the list of required document types.
    // The guide contains a JSONB field 'requiredDocuments' which we assume holds {id, name} of DocumentTypes.
    const guide = await IncentiveGuide.findOne({ 
      where: { incentiveId: incentiveId, isActive: true },
      attributes: ['requiredDocuments'] 
    });

    if (!guide || !guide.requiredDocuments || guide.requiredDocuments.length === 0) {
      // If no guide or no required documents, return an empty array.
      return res.json({
        success: true,
        data: []
      });
    }

    const requiredDocTypeIds = guide.requiredDocuments.map(doc => doc.id);

    if (requiredDocTypeIds.length === 0) {
        return res.json({
            success: true,
            data: []
        });
    }

    // Step 2: Find all documents uploaded by the user that match the required document types.
    const userDocuments = await Document.findAll({
      where: {
        userId: userId,
        documentTypeId: {
          [Op.in]: requiredDocTypeIds
        },
        status: {
            [Op.notIn]: ['archived', 'rejected'] // Don't show archived or rejected documents
        }
      },
      include: [{
        model: DocumentType,
        as: 'type', // 'documentTypeInfo' yerine 'type' olarak güncellendi
        attributes: ['name', 'description'],
      }],
      attributes: ['id', 'name'],
      order: [['uploadedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: userDocuments
    });

    logger.info('User documents fetched successfully for incentive', {
      userId: req.user.id,
      incentiveId,
      documentCount: userDocuments.length,
      requiredDocTypeIds
    });

  } catch (error) {
    logger.error('Error fetching user documents for incentive', {
      userId: req.user.id,
      incentiveId,
      error: error.message,
      stack: error.stack
    });
    console.error('Error fetching user documents for incentive:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching your documents.',
      error: error.message
    });
  }
};

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    const { applicationId, documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required'
      });
    }

    // Verify application exists and user has access
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user can upload documents for this application
    if (req.user.role !== 'admin' && application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find or create document type if provided
    let documentTypeId = null;
    if (documentType) {
      const docType = await DocumentType.findOne({
        where: { name: documentType }
      });
      if (docType) {
        documentTypeId = docType.id;
      }
    }

    // Create document record
    const document = await Document.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentTypeId: documentTypeId,
      applicationId: applicationId,
      userId: req.user.id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });

    logger.info('Document uploaded successfully', {
      userId: req.user.id,
      applicationId,
      documentId: document.id,
      fileName: req.file.originalname
    });

  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    logger.error('Error uploading document', {
      userId: req.user.id,
      applicationId: req.body.applicationId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

module.exports = {
  getMyDocumentsForIncentive,
  uploadDocument
};