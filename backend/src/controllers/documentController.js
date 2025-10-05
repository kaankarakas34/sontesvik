const { Document, IncentiveGuide, DocumentType } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

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
      },
      attributes: ['id', 'name']
      }],
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

module.exports = {
  getMyDocumentsForIncentive
};