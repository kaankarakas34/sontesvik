const { Application, Document, User, Incentive, DocumentType } = require('../models');
const ApplicationRoomService = require('../services/applicationRoomService');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId, 
      search, 
      dateFrom, 
      dateTo 
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    const includeClause = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      },
      {
        model: Incentive,
        as: 'incentive',
        attributes: ['id', 'title', 'description']
      }
    ];

    // Basic filters
    if (status) whereClause.status = status;
    if (userId) whereClause.userId = userId;

    // Date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // End of day
        whereClause.createdAt[Op.lte] = endDate;
      }
    }

    // Search filter - search in incentive title
    if (search) {
      includeClause[1].where = {
        title: {
          [Op.iLike]: `%${search}%`
        }
      };
      includeClause[1].required = true;
    }

    // If user is not admin, only show their own applications
    if (req.user.role !== 'admin') {
      whereClause.userId = req.user.id;
    }

    const applications = await Application.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: includeClause,
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    logger.info('Applications fetched successfully', {
      userId: req.user.id,
      userRole: req.user.role,
      filters: { status, userId, search, dateFrom, dateTo },
      resultCount: applications.count,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: applications.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(applications.count / limit),
        totalItems: applications.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching applications', {
      userId: req.user.id,
      userRole: req.user.role,
      filters: { status, userId, search, dateFrom, dateTo },
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

// @desc    Get current user's applications
// @route   GET /api/applications/my
// @access  Private
const getMyApplications = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      dateFrom,
      dateTo
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };

    const includeClause = [
      {
        model: Incentive,
        as: 'incentive',
        attributes: ['id', 'title', 'description']
      }
    ];

    if (status) whereClause.status = status;

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt[Op.lte] = endDate;
      }
    }

    if (search) {
      includeClause[0].where = {
        title: { [Op.iLike]: `%${search}%` }
      };
      includeClause[0].required = true;
    }

    const applications = await Application.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    logger.info('My applications fetched successfully', {
      userId: req.user.id,
      userRole: req.user.role,
      filters: { status, search, dateFrom, dateTo },
      resultCount: applications.count,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: applications.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(applications.count / limit),
        totalItems: applications.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching my applications', {
      userId: req.user.id,
      userRole: req.user.role,
      error: error.message
    });
    next(error);
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('=== GET APPLICATION BY ID DEBUG ===');
    console.log('Application ID:', id);
    console.log('Request User:', {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });

    const application = await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'companyName']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'description']
        },
        {
          model: Document,
          as: 'documents',
          include: [
            {
              model: DocumentType,
              as: 'type',
              attributes: ['id', 'name', 'nameEn', 'code']
            }
          ]
        },
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'consultantRating']
        }
      ]
    });

    if (!application) {
      console.log('Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('Application found:', {
      id: application.id,
      userId: application.userId,
      assignedConsultantId: application.assignedConsultantId
    });

    // Check if user can access this application
    const isAdmin = req.user.role === 'admin';
    const isOwner = application.userId === req.user.id;
    const isAssignedConsultant = req.user.role === 'consultant' && application.assignedConsultantId === req.user.id;

    console.log('Authorization check:', {
      isAdmin,
      isOwner,
      isAssignedConsultant,
      applicationUserId: application.userId,
      requestUserId: req.user.id,
      userRole: req.user.role,
      assignedConsultantId: application.assignedConsultantId
    });

    if (!isAdmin && !isOwner && !isAssignedConsultant) {
      console.log('ACCESS DENIED - No authorization');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('ACCESS GRANTED');
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.log('ERROR in getApplicationById:', error);
    next(error);
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res, next) => {
  try {
    const applicationData = {
      ...req.body,
      userId: req.user.id
    };

    const application = await Application.create(applicationData);

    const applicationWithDetails = await Application.findByPk(application.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'description']
        },
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'sector']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: applicationWithDetails,
      message: 'Başvurunuz oluşturuldu'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user can update this application
    if (req.user.role !== 'admin' && application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await application.update(req.body);

    const updatedApplication = await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'description']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Admin
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document for application
// @route   POST /api/applications/:id/documents
// @access  Private
const uploadApplicationDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { documentTypeId, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const application = await Application.findByPk(id);

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

    // Verify document type exists
    const documentType = await DocumentType.findByPk(documentTypeId);
    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Create document record
    const document = await Document.create({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      documentTypeId: documentTypeId,
      applicationId: id,
      userId: req.user.id,
      description: description || null,
      status: 'pending'
    });

    // Return the created document without additional includes to avoid association issues
    res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    // Clean up uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get documents for application
// @route   GET /api/applications/:id/documents
// @access  Private
const getApplicationDocuments = async (req, res, next) => {
  console.log('=== BACKEND: getApplicationDocuments BAŞLADI ===');
  console.log('Request params:', req.params);
  const { id } = req.params;

  if (!id) {
    console.log('Application ID is missing');
    return res.status(400).json({ success: false, message: 'Application ID is required' });
  }

  try {
    const application = await Application.findByPk(id);
    if (!application) {
      console.log('Application not found with ID:', id);
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check if user can access this application (same logic as getApplicationById)
    const isAdmin = req.user.role === 'admin';
    const isOwner = application.userId === req.user.id;
    const isAssignedConsultant = req.user.role === 'consultant' && application.assignedConsultantId === req.user.id;

    console.log('Authorization check:', {
      isAdmin,
      isOwner,
      isAssignedConsultant,
      applicationUserId: application.userId,
      requestUserId: req.user.id,
      userRole: req.user.role,
      assignedConsultantId: application.assignedConsultantId
    });

    if (!isAdmin && !isOwner && !isAssignedConsultant) {
      console.log('ACCESS DENIED - No authorization');
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    console.log('Yetkilendirme başarılı, belgeler getiriliyor...');
    console.log('Fetching documents for application:', id);

    const documents = await Document.findAll({
      where: { applicationId: id },
      include: [
        {
          model: DocumentType,
          as: 'type',
          attributes: ['id', 'name', 'nameEn', 'code']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Documents fetched:', documents.length);
    console.log('Document detayları:', documents.map(doc => ({
      id: doc.id,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      createdAt: doc.createdAt
    })));

    const response = {
      success: true,
      data: documents
    };

    console.log('Gönderilen yanıt:', JSON.stringify(response, null, 2));
    console.log('=== BACKEND: getApplicationDocuments BAŞARIYLA BİTTİ ===');

    res.status(200).json(response);
  } catch (error) {
    console.error('=== BACKEND: getApplicationDocuments HATASI ===');
    console.error('Error fetching documents for application:', { applicationId: id, errorMessage: error.message, errorStack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

// @desc    Delete application document
// @route   DELETE /api/applications/:id/documents/:documentId
// @access  Private
const deleteApplicationDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const document = await Document.findOne({
      where: { id: documentId, applicationId: id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user can delete this document
    if (req.user.role !== 'admin' && application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document record
    await document.destroy();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download application document
// @route   GET /api/applications/:id/documents/:documentId/download
// @access  Private
const downloadApplicationDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const document = await Document.findOne({
      where: { id: documentId, applicationId: id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user can download this document
    if (req.user.role !== 'admin' && application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    await document.incrementDownloadCount();

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);

    // Stream file to response
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};