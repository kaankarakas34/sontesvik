const { Application, Incentive, ApplicationIncentive, User, Sector, IncentiveType } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const ConsultantAssignmentService = require('../services/consultantAssignmentService');

/**
 * Get available incentives for selection
 * Supports filtering by sector, incentive type, and search query
 */
const getAvailableIncentives = async (req, res) => {
  try {
    const { sector, incentiveType, search, page = 1, limit = 20 } = req.query;
    
    // Build where clause for filtering
    const whereClause = {
      status: 'active' // Only show active incentives
    };

    // Add sector filter (using foreign key)
    if (sector) {
      whereClause.sectorId = sector;
    }

    // Add incentive type filter (using foreign key)
    if (incentiveType) {
      whereClause.incentiveTypeId = incentiveType;
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { provider: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    // Fetch incentives with related data
    const { count, rows: incentives } = await Incentive.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        },
        {
          model: IncentiveType,
          as: 'incentiveTypeModel',
          attributes: ['id', 'name']
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt'] // Exclude sensitive fields
      },
      order: [['title', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get filter options for frontend
    const sectors = await Sector.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });

    const incentiveTypes = await IncentiveType.findAll({
      where: { isActive: true },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        incentives,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        filters: {
          sectors,
          incentiveTypes
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching available incentives:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch available incentives',
        code: 'FETCH_INCENTIVES_ERROR'
      }
    });
  }
};

/**
 * Create application with selected incentives
 */
const createApplicationWithIncentives = async (req, res) => {
  const transaction = await Application.sequelize.transaction();
  
  try {
    const { applicationData, incentiveIds } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!applicationData || !incentiveIds || !Array.isArray(incentiveIds) || incentiveIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'Application data and incentive IDs are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Validate incentive IDs exist and are active
    const incentives = await Incentive.findAll({
      where: {
        id: incentiveIds,
        status: 'active'
      },
      attributes: ['id', 'title', 'maxAmount', 'currency']
    });

    if (incentives.length !== incentiveIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'Some incentives are not available',
          code: 'INVALID_INCENTIVES'
        }
      });
    }

    // Generate unique application number if not provided
    const timestamp = Date.now();
    const applicationNumber = applicationData.applicationNumber || `APP-${timestamp}`;

    // Create application
    const application = await Application.create({
      ...applicationData,
      applicationNumber,
      userId,
      status: 'draft',
      currentStep: 'basvuru'
    }, { transaction });

    // Create junction records for selected incentives
    const applicationIncentives = await ApplicationIncentive.bulkCreate(
      incentiveIds.map(incentiveId => ({
        applicationId: application.id,
        incentiveId: incentiveId,
        status: 'pending'
      })),
      { transaction }
    );

    await transaction.commit();

    // Otomatik danışman ataması - kullanıcının sektörüne göre
    let assignmentResult = null;
    try {
      const user = await User.findByPk(userId, { attributes: ['sectorId'] });
      if (user && user.sectorId) {
        assignmentResult = await ConsultantAssignmentService.autoAssignConsultant(
          application.id, 
          user.sectorId
        );
        
        if (assignmentResult.success) {
          logger.info('Consultant automatically assigned', {
            applicationId: application.id,
            consultantId: assignmentResult.consultantId,
            consultantName: assignmentResult.consultantName
          });
        } else {
          logger.warn('Automatic consultant assignment failed', {
            applicationId: application.id,
            reason: assignmentResult.message
          });
        }
      }
    } catch (assignmentError) {
      logger.error('Error during automatic consultant assignment:', {
        applicationId: application.id,
        error: assignmentError.message
      });
      // Assignment hatası application oluşturma işlemini etkilemez
    }

    // Fetch the complete application with incentives
    const completeApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Incentive,
          as: 'incentives',
          through: { attributes: ['status', 'notes'] },
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name', 'code']
            },
            {
              model: IncentiveType,
              as: 'incentiveTypeModel',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'assignedConsultant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'consultantRating']
        }
      ]
    });

    logger.info('Application created with incentives', {
      applicationId: application.id,
      userId,
      incentiveCount: incentiveIds.length
    });

    res.json({
      success: true,
      data: completeApplication,
      consultantAssignment: assignmentResult
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating application with incentives:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create application with incentives',
        code: 'CREATE_APPLICATION_ERROR'
      }
    });
  }
};

/**
 * Get application with its selected incentives
 */
const getApplicationIncentives = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find application with incentives
    const application = await Application.findOne({
      where: { 
        id,
        userId // Ensure user can only see their own applications
      },
      include: [
        {
          model: Incentive,
          as: 'incentives',
          through: { 
            attributes: ['status', 'notes', 'createdAt', 'updatedAt']
          },
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name', 'code']
            },
            {
              model: IncentiveType,
              as: 'incentiveTypeModel',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'companyName']
        }
      ],
      order: [[{ model: Incentive, as: 'incentives' }, 'title', 'ASC']]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        }
      });
    }

    // Calculate total support amount
    const totalSupport = application.incentives.reduce((total, incentive) => {
      return total + (incentive.maxAmount || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        application,
        summary: {
          totalIncentives: application.incentives.length,
          totalSupportAmount: totalSupport,
          currency: application.incentives[0]?.currency || 'TRY'
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching application incentives:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch application incentives',
        code: 'FETCH_APPLICATION_INCENTIVES_ERROR'
      }
    });
  }
};

/**
 * Add incentives to existing application
 */
const addIncentivesToApplication = async (req, res) => {
  const transaction = await Application.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { incentiveIds, notes } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!incentiveIds || !Array.isArray(incentiveIds) || incentiveIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'Incentive IDs are required',
          code: 'VALIDATION_ERROR'
        }
      });
    }

    // Check if application exists and belongs to user
    const application = await Application.findOne({
      where: { id, userId },
      include: [{
        model: Incentive,
        as: 'incentives',
        attributes: ['id']
      }]
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        }
      });
    }

    // Get existing incentive IDs to avoid duplicates
    const existingIncentiveIds = application.incentives.map(inc => inc.id);
    const newIncentiveIds = incentiveIds.filter(id => !existingIncentiveIds.includes(id));

    if (newIncentiveIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'All selected incentives are already added to this application',
          code: 'DUPLICATE_INCENTIVES'
        }
      });
    }

    // Validate new incentive IDs exist and are active
    const validIncentives = await Incentive.findAll({
      where: {
        id: newIncentiveIds,
        status: 'active',
        isActive: true
      },
      attributes: ['id', 'title', 'maxAmount']
    });

    if (validIncentives.length !== newIncentiveIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'Some incentives are not available',
          code: 'INVALID_INCENTIVES'
        }
      });
    }

    // Create junction records for new incentives
    const applicationIncentives = await ApplicationIncentive.bulkCreate(
      newIncentiveIds.map(incentiveId => ({
        applicationId: application.id,
        incentiveId: incentiveId,
        status: 'selected',
        notes: notes || null
      })),
      { transaction }
    );

    await transaction.commit();

    // Fetch updated application with all incentives
    const updatedApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Incentive,
          as: 'incentives',
          through: { attributes: ['status', 'notes', 'createdAt'] },
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name', 'code']
            },
            {
              model: IncentiveType,
              as: 'incentiveTypeModel',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    });

    logger.info('Incentives added to application', {
      applicationId: application.id,
      userId,
      addedIncentives: newIncentiveIds.length,
      totalIncentives: updatedApplication.incentives.length
    });

    res.json({
      success: true,
      data: {
        application: updatedApplication,
        addedIncentives: validIncentives,
        summary: {
          totalIncentives: updatedApplication.incentives.length,
          addedCount: newIncentiveIds.length
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error adding incentives to application:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to add incentives to application',
        code: 'ADD_INCENTIVES_ERROR'
      }
    });
  }
};

module.exports = {
  getAvailableIncentives,
  createApplicationWithIncentives,
  getApplicationIncentives,
  addIncentivesToApplication
};