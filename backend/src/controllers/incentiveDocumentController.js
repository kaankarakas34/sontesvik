const { IncentiveDocument, DocumentType, Incentive } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all incentive documents
// @route   GET /api/incentive-documents
// @access  Public
const getIncentiveDocuments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      incentiveId,
      documentTypeId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (incentiveId) {
      where.incentiveId = incentiveId;
    }

    if (documentTypeId) {
      where.documentTypeId = documentTypeId;
    }

    const { count, rows: incentiveDocuments } = await IncentiveDocument.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'nameEn', 'code', 'isRequired', 'isActive']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'shortDescription']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        incentiveDocuments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incentive document by ID
// @route   GET /api/incentive-documents/:id
// @access  Public
const getIncentiveDocumentById = async (req, res, next) => {
  try {
    const incentiveDocument = await IncentiveDocument.findByPk(req.params.id, {
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'nameEn', 'code', 'isRequired', 'isActive']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['id', 'title', 'shortDescription']
        }
      ]
    });

    if (!incentiveDocument) {
      return res.status(404).json({
        success: false,
        error: 'Teşvik belgesi eşleştirmesi bulunamadı'
      });
    }

    res.json({
      success: true,
      data: incentiveDocument
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get documents by incentive ID
// @route   GET /api/incentive-documents/incentive/:incentiveId
// @access  Public
const getDocumentsByIncentiveId = async (req, res, next) => {
  try {
    const { incentiveId } = req.params;
    
    const incentiveDocuments = await IncentiveDocument.findAll({
      where: { incentiveId },
      include: [
        {
          model: DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'nameEn', 'code', 'isRequired', 'isActive']
        }
      ]
    });

    res.json({
      success: true,
      data: incentiveDocuments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create incentive document
// @route   POST /api/incentive-documents
// @access  Private/Admin
const createIncentiveDocument = async (req, res, next) => {
  try {
    const { incentiveId, documentTypeId, isRequired } = req.body;

    // Check if incentive exists
    const incentive = await Incentive.findByPk(incentiveId);
    if (!incentive) {
      return res.status(404).json({
        success: false,
        error: 'Teşvik bulunamadı'
      });
    }

    // Check if document type exists
    const documentType = await DocumentType.findByPk(documentTypeId);
    if (!documentType) {
      return res.status(404).json({
        success: false,
        error: 'Belge türü bulunamadı'
      });
    }

    // Check if mapping already exists
    const existingMapping = await IncentiveDocument.findOne({
      where: {
        incentiveId,
        documentTypeId
      }
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        error: 'Bu teşvik ve belge türü zaten eşleştirilmiş'
      });
    }

    const incentiveDocument = await IncentiveDocument.create({
      incentiveId,
      documentTypeId,
      isRequired: isRequired !== undefined ? isRequired : documentType.isRequired
    });

    res.status(201).json({
      success: true,
      data: incentiveDocument
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update incentive document
// @route   PUT /api/incentive-documents/:id
// @access  Private/Admin
const updateIncentiveDocument = async (req, res, next) => {
  try {
    const { isRequired } = req.body;
    
    const incentiveDocument = await IncentiveDocument.findByPk(req.params.id);

    if (!incentiveDocument) {
      return res.status(404).json({
        success: false,
        error: 'Teşvik belgesi eşleştirmesi bulunamadı'
      });
    }

    incentiveDocument.isRequired = isRequired;
    await incentiveDocument.save();

    res.json({
      success: true,
      data: incentiveDocument
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete incentive document
// @route   DELETE /api/incentive-documents/:id
// @access  Private/Admin
const deleteIncentiveDocument = async (req, res, next) => {
  try {
    const incentiveDocument = await IncentiveDocument.findByPk(req.params.id);

    if (!incentiveDocument) {
      return res.status(404).json({
        success: false,
        error: 'Teşvik belgesi eşleştirmesi bulunamadı'
      });
    }

    await incentiveDocument.destroy();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch create incentive documents
// @route   POST /api/incentive-documents/batch
// @access  Private/Admin
const batchCreateIncentiveDocuments = async (req, res, next) => {
  try {
    const { incentiveId, documentTypeIds } = req.body;

    // Check if incentive exists
    const incentive = await Incentive.findByPk(incentiveId);
    if (!incentive) {
      return res.status(404).json({
        success: false,
        error: 'Teşvik bulunamadı'
      });
    }

    // Get existing mappings
    const existingMappings = await IncentiveDocument.findAll({
      where: {
        incentiveId,
        documentTypeId: {
          [Op.in]: documentTypeIds
        }
      }
    });

    const existingDocumentTypeIds = existingMappings.map(mapping => mapping.documentTypeId);
    const newDocumentTypeIds = documentTypeIds.filter(id => !existingDocumentTypeIds.includes(id));

    // Create new mappings
    const newMappings = [];
    for (const documentTypeId of newDocumentTypeIds) {
      const documentType = await DocumentType.findByPk(documentTypeId);
      if (documentType) {
        const mapping = await IncentiveDocument.create({
          incentiveId,
          documentTypeId,
          isRequired: documentType.isRequired
        });
        newMappings.push(mapping);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        created: newMappings.length,
        skipped: existingDocumentTypeIds.length,
        mappings: newMappings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncentiveDocuments,
  getIncentiveDocumentById,
  getDocumentsByIncentiveId,
  createIncentiveDocument,
  updateIncentiveDocument,
  deleteIncentiveDocument,
  batchCreateIncentiveDocuments
};