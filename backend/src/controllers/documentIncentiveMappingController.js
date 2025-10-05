const { DocumentIncentiveMapping, DocumentType, IncentiveType, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all document-incentive mappings
// @route   GET /api/document-incentive-mappings
// @access  Private/Admin
const getDocumentIncentiveMappings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      documentTypeId,
      incentiveTypeId,
      isRequired,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (documentTypeId) {
      where.documentTypeId = documentTypeId;
    }

    if (incentiveTypeId) {
      where.incentiveTypeId = incentiveTypeId;
    }

    if (isRequired !== undefined) {
      where.isRequired = isRequired === 'true';
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Include related models
    const include = [
      {
        model: DocumentType,
        as: 'documentType',
        attributes: ['id', 'name', 'description', 'isRequired', 'isActive'],
        where: search ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined
      },
      {
        model: IncentiveType,
        as: 'incentiveType',
        attributes: ['id', 'name', 'description', 'isActive', 'sectorId'],
        include: [{
          model: require('../models').Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        }],
        where: search ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ];

    const { count, rows: mappings } = await DocumentIncentiveMapping.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    res.json({
      success: true,
      data: {
        mappings,
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

// @desc    Get document-incentive mapping by ID
// @route   GET /api/document-incentive-mappings/:id
// @access  Private/Admin
const getDocumentIncentiveMappingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mapping = await DocumentIncentiveMapping.findByPk(id, {
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'description', 'isRequired', 'isActive']
        },
        {
          model: IncentiveType,
          as: 'incentiveType',
          attributes: ['id', 'name', 'description', 'isActive', 'sectorId'],
          include: [{
            model: require('../models').Sector,
            as: 'sector',
            attributes: ['id', 'name', 'code']
          }]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document-incentive mapping not found' }
      });
    }

    res.json({
      success: true,
      data: { mapping }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new document-incentive mapping
// @route   POST /api/document-incentive-mappings
// @access  Private/Admin
const createDocumentIncentiveMapping = async (req, res, next) => {
  try {
    const {
      documentTypeId,
      incentiveTypeId,
      isRequired = true,
      description,
      sortOrder = 0,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!documentTypeId || !incentiveTypeId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Document type ID and incentive type ID are required' }
      });
    }

    // Check if document type exists
    const documentType = await DocumentType.findByPk(documentTypeId);
    if (!documentType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document type not found' }
      });
    }

    // Check if incentive type exists
    const incentiveType = await IncentiveType.findByPk(incentiveTypeId);
    if (!incentiveType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Incentive type not found' }
      });
    }

    // Check if mapping already exists
    const existingMapping = await DocumentIncentiveMapping.findOne({
      where: {
        documentTypeId,
        incentiveTypeId
      }
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        error: { message: 'This document-incentive mapping already exists' }
      });
    }

    const mapping = await DocumentIncentiveMapping.create({
      documentTypeId,
      incentiveTypeId,
      isRequired,
      description,
      sortOrder,
      isActive,
      createdBy: req.user.id
    });

    // Fetch the created mapping with associations
    const createdMapping = await DocumentIncentiveMapping.findByPk(mapping.id, {
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'description', 'isRequired', 'isActive']
        },
        {
          model: IncentiveType,
          as: 'incentiveType',
          attributes: ['id', 'name', 'description', 'isActive', 'sectorId'],
          include: [{
            model: require('../models').Sector,
            as: 'sector',
            attributes: ['id', 'name', 'code']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Document-incentive mapping created successfully',
      data: { mapping: createdMapping }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'This document-incentive mapping already exists' }
      });
    }
    next(error);
  }
};

// @desc    Update document-incentive mapping
// @route   PUT /api/document-incentive-mappings/:id
// @access  Private/Admin
const updateDocumentIncentiveMapping = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      isRequired,
      description,
      sortOrder,
      isActive
    } = req.body;

    const mapping = await DocumentIncentiveMapping.findByPk(id);
    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document-incentive mapping not found' }
      });
    }

    await mapping.update({
      isRequired: isRequired !== undefined ? isRequired : mapping.isRequired,
      description: description !== undefined ? description : mapping.description,
      sortOrder: sortOrder !== undefined ? sortOrder : mapping.sortOrder,
      isActive: isActive !== undefined ? isActive : mapping.isActive,
      updatedBy: req.user.id
    });

    // Fetch the updated mapping with associations
    const updatedMapping = await DocumentIncentiveMapping.findByPk(mapping.id, {
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'description', 'isRequired', 'isActive']
        },
        {
          model: IncentiveType,
          as: 'incentiveType',
          attributes: ['id', 'name', 'description', 'isActive', 'sectorId'],
          include: [{
            model: require('../models').Sector,
            as: 'sector',
            attributes: ['id', 'name', 'code']
          }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Document-incentive mapping updated successfully',
      data: { mapping: updatedMapping }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document-incentive mapping
// @route   DELETE /api/document-incentive-mappings/:id
// @access  Private/Admin
const deleteDocumentIncentiveMapping = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mapping = await DocumentIncentiveMapping.findByPk(id);
    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document-incentive mapping not found' }
      });
    }

    await mapping.destroy();

    res.json({
      success: true,
      message: 'Document-incentive mapping deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle document-incentive mapping status
// @route   PATCH /api/document-incentive-mappings/:id/toggle-status
// @access  Private/Admin
const toggleDocumentIncentiveMappingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mapping = await DocumentIncentiveMapping.findByPk(id);
    if (!mapping) {
      return res.status(404).json({
        success: false,
        error: { message: 'Document-incentive mapping not found' }
      });
    }

    await mapping.update({
      isActive: !mapping.isActive,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      message: `Document-incentive mapping ${mapping.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { mapping }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get required documents for an incentive type
// @route   GET /api/document-incentive-mappings/incentive/:incentiveTypeId/documents
// @access  Public
const getRequiredDocumentsForIncentive = async (req, res, next) => {
  try {
    const { incentiveTypeId } = req.params;
    const { isRequired } = req.query;

    const where = {
      incentiveTypeId,
      isActive: true
    };

    if (isRequired !== undefined) {
      where.isRequired = isRequired === 'true';
    }

    const mappings = await DocumentIncentiveMapping.findAll({
      where,
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'description', 'fileTypes', 'maxFileSize', 'isActive'],
          where: { isActive: true }
        }
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    const documents = mappings.map(mapping => ({
      id: mapping.documentType.id,
      name: mapping.documentType.name,
      description: mapping.documentType.description,
      fileTypes: mapping.documentType.fileTypes,
      maxFileSize: mapping.documentType.maxFileSize,
      isRequired: mapping.isRequired,
      mappingDescription: mapping.description,
      sortOrder: mapping.sortOrder
    }));

    res.json({
      success: true,
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocumentIncentiveMappings,
  getDocumentIncentiveMappingById,
  createDocumentIncentiveMapping,
  updateDocumentIncentiveMapping,
  deleteDocumentIncentiveMapping,
  toggleDocumentIncentiveMappingStatus,
  getRequiredDocumentsForIncentive
};