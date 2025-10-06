const { Incentive, Sector, IncentiveType, IncentiveCategory, IncentiveGuide, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get incentives by user's sector
// @route   GET /api/incentives/by-sector
// @access  Private
const getIncentivesBySector = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.sector) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcının sektör bilgisi bulunamadı'
      });
    }

    // Map user sector enum to sector name
    const sectorMapping = {
      'healthcare': 'Sağlık',
      'technology': 'Teknoloji',
      'education': 'Eğitim',
      'finance': 'Finans',
      'energy': 'Enerji',
      'manufacturing': 'İmalat',
      'tourism': 'Turizm',
      'agriculture': 'Tarım',
      'construction': 'İnşaat',
      'other': 'Diğer'
    };

    const sectorName = sectorMapping[user.sector];
    if (!sectorName) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz sektör bilgisi'
      });
    }

    // Find sector by name
    const sector = await Sector.findOne({ where: { name: sectorName } });
    if (!sector) {
      return res.status(400).json({
        success: false,
        message: 'Sektör bulunamadı'
      });
    }

    const {
      page = 1,
      limit = 10,
      search,
      incentiveType,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {
      sectorId: sector.id,
      status: 'active'
    };

    // Apply filters
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (incentiveType) {
      where.incentiveType = incentiveType;
    }

    const { count, rows: incentives } = await Incentive.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      distinct: true
    });

    res.json({
      success: true,
      data: {
        incentives,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });

    logger.info('Incentives by sector fetched successfully', {
      userId: req.user.id,
      userSector: user.sector,
      sectorName,
      filters: { search, incentiveType, status },
      pagination: { page, limit, total: count }
    });

  } catch (error) {
    logger.error('Error fetching incentives by sector', {
      userId: req.user.id,
      userSector: user.sector,
      sectorName,
      error: error.message,
      stack: error.stack
    });
    console.error('Error fetching incentives by sector:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Get all incentives
// @route   GET /api/incentives
// @access  Public
const getIncentives = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sectorId,
      sector,
      incentiveType,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Handle sector parameter - map sector enum to sectorId
    if (sector && !sectorId) {
      // Map user sector enum to sector name
      const sectorMapping = {
        'healthcare': 'Sağlık',
        'technology': 'Teknoloji',
        'education': 'Eğitim',
        'finance': 'Finans',
        'energy': 'Enerji',
        'manufacturing': 'İmalat',
        'tourism': 'Turizm',
        'agriculture': 'Tarım',
        'construction': 'İnşaat',
        'other': 'Diğer'
      };

      const sectorName = sectorMapping[sector];
      if (sectorName) {
        // Find sector by name
        const sectorRecord = await Sector.findOne({ where: { name: sectorName } });
        if (sectorRecord) {
          where.sectorId = sectorRecord.id;
        }
      }
    } else if (sectorId) {
      where.sectorId = sectorId;
    }

    if (incentiveType) {
      where.incentiveType = incentiveType;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows: incentives } = await Incentive.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        incentives,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching incentives:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvikler getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Get incentive by ID
// @route   GET /api/incentives/:id
// @access  Public
const getIncentiveById = async (req, res) => {
  try {
    const { id } = req.params;

    const incentive = await Incentive.findByPk(id, {
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        },
        {
          model: IncentiveType,
          as: 'incentiveTypeModel',
          attributes: ['id', 'name', 'description']
        },
        {
          model: IncentiveGuide,
          as: 'guide',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    res.json({
      success: true,
      data: incentive
    });
  } catch (error) {
    console.error('Error fetching incentive:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Create new incentive (Admin only)
const createIncentive = async (req, res) => {
  try {
    const incentiveData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const incentive = await Incentive.create(incentiveData);

    // Set single sector via FK if provided
    if (req.body.sector_id || req.body.sectorId) {
      await incentive.update({ sectorId: req.body.sector_id || req.body.sectorId });
    }

    const createdIncentive = await Incentive.findByPk(incentive.id, {
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        },
        {
          model: IncentiveType,
          as: 'incentiveTypeModel',
          attributes: ['id', 'name', 'description']
        },
        
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Teşvik başarıyla oluşturuldu',
      data: createdIncentive
    });
  } catch (error) {
    console.error('Error creating incentive:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik oluşturulurken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Update incentive (Admin only)
const updateIncentive = async (req, res) => {
  try {
    const { id } = req.params;

    const incentive = await Incentive.findByPk(id);
    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    await incentive.update({
      ...req.body,
      updatedBy: req.user.id
    });

    // Update single sector via FK if provided
    if (req.body.sector_id || req.body.sectorId) {
      await incentive.update({ sectorId: req.body.sector_id || req.body.sectorId });
    }

    const updatedIncentive = await Incentive.findByPk(id, {
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        },
        {
          model: IncentiveType,
          as: 'incentiveTypeModel',
          attributes: ['id', 'name', 'description']
        },
        
      ]
    });

    res.json({
      success: true,
      message: 'Teşvik başarıyla güncellendi',
      data: updatedIncentive
    });
  } catch (error) {
    console.error('Error updating incentive:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik güncellenirken bir hata oluştu',
      error: error.message
    });
  }
};

// @desc    Delete incentive (Admin only)
const deleteIncentive = async (req, res) => {
  try {
    const { id } = req.params;

    const incentive = await Incentive.findByPk(id);
    if (!incentive) {
      return res.status(404).json({
        success: false,
        message: 'Teşvik bulunamadı'
      });
    }

    await incentive.destroy();

    res.json({
      success: true,
      message: 'Teşvik başarıyla silindi'
    });
  } catch (error) {
    console.error('Error deleting incentive:', error);
    res.status(500).json({
      success: false,
      message: 'Teşvik silinirken bir hata oluştu',
      error: error.message
    });
  }
};

module.exports = {
  getIncentivesBySector,
  getIncentives,
  getIncentiveById,
  createIncentive,
  updateIncentive,
  deleteIncentive
};