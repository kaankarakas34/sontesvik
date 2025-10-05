const { DocumentType } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all document types
// @route   GET /api/document-types
// @access  Public
const getDocumentTypes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      isRequired,
      sortBy = 'sortOrder',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { nameEn: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isRequired !== undefined) {
      where.isRequired = isRequired === 'true';
    }

    const { count, rows: documentTypes } = await DocumentType.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        documentTypes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document type by ID
// @route   GET /api/document-types/:id
// @access  Public
const getDocumentTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const documentType = await DocumentType.findByPk(id);

    if (!documentType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document type not found' }
      });
    }

    res.json({
      success: true,
      data: { documentType }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new document type
// @route   POST /api/document-types
// @access  Private/Admin
const createDocumentType = async (req, res, next) => {
  try {
    const {
      name,
      nameEn,
      code,
      description,
      descriptionEn,
      validityDate,
      isRequired = false,
      maxFileSize,
      allowedMimeTypes,
      sortOrder = 0,
      isActive = true,
      icon,
      color
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Document type name is required' }
      });
    }

    const documentType = await DocumentType.create({
      name,
      nameEn,
      code,
      description,
      descriptionEn,
      validityDate,
      isRequired,
      maxFileSize,
      allowedMimeTypes: allowedMimeTypes ? JSON.stringify(allowedMimeTypes) : null,
      sortOrder,
      isActive,
      icon,
      color
    });

    res.status(201).json({
      success: true,
      message: 'Document type created successfully',
      data: { documentType }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Document type name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Update document type
// @route   PUT /api/document-types/:id
// @access  Private/Admin
const updateDocumentType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      nameEn,
      code,
      description,
      descriptionEn,
      validityDate,
      isRequired,
      maxFileSize,
      allowedMimeTypes,
      sortOrder,
      isActive,
      icon,
      color
    } = req.body;

    const documentType = await DocumentType.findByPk(id);
    if (!documentType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document type not found' }
      });
    }

    await documentType.update({
      name: name || documentType.name,
      nameEn: nameEn !== undefined ? nameEn : documentType.nameEn,
      code: code !== undefined ? code : documentType.code,
      description: description !== undefined ? description : documentType.description,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : documentType.descriptionEn,
      validityDate: validityDate !== undefined ? validityDate : documentType.validityDate,
      isRequired: isRequired !== undefined ? isRequired : documentType.isRequired,
      maxFileSize: maxFileSize !== undefined ? maxFileSize : documentType.maxFileSize,
      allowedMimeTypes: allowedMimeTypes !== undefined ? JSON.stringify(allowedMimeTypes) : documentType.allowedMimeTypes,
      sortOrder: sortOrder !== undefined ? sortOrder : documentType.sortOrder,
      isActive: isActive !== undefined ? isActive : documentType.isActive,
      icon: icon !== undefined ? icon : documentType.icon,
      color: color !== undefined ? color : documentType.color
    });

    res.json({
      success: true,
      message: 'Document type updated successfully',
      data: { documentType }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Document type name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Delete document type
// @route   DELETE /api/document-types/:id
// @access  Private/Admin
const deleteDocumentType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const documentType = await DocumentType.findByPk(id);
    if (!documentType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document type not found' }
      });
    }

    // Check if document type is being used by any documents
    const { Document } = require('../models');
    const documentCount = await Document.count({
      where: { documentType: id }
    });

    if (documentCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete document type that is being used by documents' }
      });
    }

    await documentType.destroy();

    res.json({
      success: true,
      message: 'Document type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle document type status
// @route   PATCH /api/document-types/:id/toggle-status
// @access  Private/Admin
const toggleDocumentTypeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const documentType = await DocumentType.findByPk(id);
    if (!documentType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document type not found' }
      });
    }

    await documentType.update({
      isActive: !documentType.isActive
    });

    res.json({
      success: true,
      message: `Document type ${documentType.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { documentType }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle document type required status
// @route   PATCH /api/document-types/:id/toggle-required
// @access  Private/Admin
const toggleDocumentTypeRequired = async (req, res, next) => {
  try {
    const { id } = req.params;

    const documentType = await DocumentType.findByPk(id);
    if (!documentType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document type not found' }
      });
    }

    await documentType.update({
      isRequired: !documentType.isRequired
    });

    res.json({
      success: true,
      message: `Document type marked as ${documentType.isRequired ? 'required' : 'optional'} successfully`,
      data: { documentType }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  toggleDocumentTypeStatus,
  toggleDocumentTypeRequired
};