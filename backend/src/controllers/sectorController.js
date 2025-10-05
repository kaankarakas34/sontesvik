const { Sector, Incentive, SectorIncentive } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get all sectors
// @route   GET /api/sectors
// @access  Public
const getSectors = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: sectors } = await Sector.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: {
        sectors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });

    logger.info('Sectors fetched successfully', {
      userId: req.user?.id,
      userRole: req.user?.role,
      filters: { search, isActive },
      pagination: { page, limit, total: count }
    });

  } catch (error) {
    logger.error('Error fetching sectors', {
      userId: req.user?.id,
      userRole: req.user?.role,
      filters: { search, isActive },
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

// @desc    Get all sectors with their incentives
// @route   GET /api/sectors/with-incentives
// @access  Public
const getSectorsWithIncentives = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const { count, rows: sectors } = await Sector.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [
        {
          model: Incentive,
          through: { attributes: [] }, // SectorIncentive ara tablosunun verilerini dahil etme
          attributes: ['id', 'title', 'status', 'incentiveType', 'provider']
        }
      ]
    });

    res.json({
      success: true,
      data: {
        sectors,
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

// @desc    Get sector by ID
// @route   GET /api/sectors/:id
// @access  Public
const getSectorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findByPk(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' }
      });
    }

    res.json({
      success: true,
      data: { sector }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sector
// @route   POST /api/sectors
// @access  Private/Admin
const createSector = async (req, res, next) => {
  try {
    const {
      name,
      code,
      description,
      descriptionEn,
      isActive = true,
      icon,
      color
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Sector name is required' }
      });
    }

    const sector = await Sector.create({
      name,
      code,
      description,
      descriptionEn,
      isActive,
      icon,
      color
    });

    res.status(201).json({
      success: true,
      message: 'Sector created successfully',
      data: { sector }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Sector name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Create new sector with incentives
// @route   POST /api/sectors/with-incentives
// @access  Private/Admin
const createSectorWithIncentives = async (req, res, next) => {
  try {
    const {
      name,
      code,
      description,
      descriptionEn,
      isActive = true,
      icon,
      color,
      incentiveIds = []
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Sector name is required' }
      });
    }

    // Create sector
    const sector = await Sector.create({
      name,
      code,
      description,
      descriptionEn,
      isActive,
      icon,
      color
    });

    // Add incentives if provided
    if (incentiveIds && incentiveIds.length > 0) {
      // Validate incentive IDs exist
      const incentives = await Incentive.findAll({
        where: { id: incentiveIds }
      });

      if (incentives.length !== incentiveIds.length) {
        return res.status(400).json({
          success: false,
          error: { message: 'One or more incentive IDs are invalid' }
        });
      }

      // Associate incentives with sector
      await sector.setIncentives(incentives);
    }

    // Fetch sector with incentives for response
    const sectorWithIncentives = await Sector.findByPk(sector.id, {
      include: [
        {
          model: Incentive,
          through: { attributes: [] },
          attributes: ['id', 'title', 'status', 'incentiveType', 'provider']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Sector created successfully with incentives',
      data: { sector: sectorWithIncentives }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Sector name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Update sector incentives
// @route   PUT /api/sectors/:id/incentives
// @access  Private/Admin
const updateSectorIncentives = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { incentiveIds = [] } = req.body;

    const sector = await Sector.findByPk(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' }
      });
    }

    // Validate incentive IDs if provided
    if (incentiveIds.length > 0) {
      const incentives = await Incentive.findAll({
        where: { id: incentiveIds }
      });

      if (incentives.length !== incentiveIds.length) {
        return res.status(400).json({
          success: false,
          error: { message: 'One or more incentive IDs are invalid' }
        });
      }

      // Update sector incentives
      await sector.setIncentives(incentives);
    } else {
      // Remove all incentives if empty array provided
      await sector.setIncentives([]);
    }

    // Fetch updated sector with incentives
    const updatedSector = await Sector.findByPk(id, {
      include: [
        {
          model: Incentive,
          through: { attributes: [] },
          attributes: ['id', 'title', 'status', 'incentiveType', 'provider']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Sector incentives updated successfully',
      data: { sector: updatedSector }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sector by ID with incentives
// @route   GET /api/sectors/:id/with-incentives
// @access  Public
const getSectorWithIncentives = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findByPk(id, {
      include: [
        {
          model: Incentive,
          through: { attributes: [] },
          attributes: ['id', 'title', 'status', 'incentiveType', 'provider', 'description']
        }
      ]
    });

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' }
      });
    }

    res.json({
      success: true,
      data: { sector }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sector with incentives
// @route   PUT /api/sectors/:id/with-incentives
// @access  Private/Admin
const updateSectorWithIncentives = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      description,
      descriptionEn,
      isActive,
      icon,
      color,
      incentiveIds = []
    } = req.body;

    const sector = await Sector.findByPk(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' }
      });
    }

    // Update sector basic info
    await sector.update({
      name: name || sector.name,
      code: code !== undefined ? code : sector.code,
      description: description !== undefined ? description : sector.description,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : sector.descriptionEn,
      isActive: isActive !== undefined ? isActive : sector.isActive,
      icon: icon !== undefined ? icon : sector.icon,
      color: color !== undefined ? color : sector.color
    });

    // Update incentives if provided
    if (incentiveIds.length > 0) {
      const incentives = await Incentive.findAll({
        where: { id: incentiveIds }
      });

      if (incentives.length !== incentiveIds.length) {
        return res.status(400).json({
          success: false,
          error: { message: 'One or more incentive IDs are invalid' }
        });
      }

      await sector.setIncentives(incentives);
    } else {
      // Remove all incentives if empty array provided
      await sector.setIncentives([]);
    }

    // Fetch updated sector with incentives
    const updatedSector = await Sector.findByPk(id, {
      include: [
        {
          model: Incentive,
          through: { attributes: [] },
          attributes: ['id', 'title', 'status', 'incentiveType', 'provider']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Sector updated successfully',
      data: { sector: updatedSector }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Sector name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Update sector
// @route   PUT /api/sectors/:id
// @access  Private/Admin
const updateSector = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      description,
      descriptionEn,
      isActive,
      icon,
      color
    } = req.body;

    const sector = await Sector.findByPk(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' }
      });
    }

    await sector.update({
      name: name || sector.name,
      code: code !== undefined ? code : sector.code,
      description: description !== undefined ? description : sector.description,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : sector.descriptionEn,
      isActive: isActive !== undefined ? isActive : sector.isActive,
      icon: icon !== undefined ? icon : sector.icon,
      color: color !== undefined ? color : sector.color
    });

    res.json({
      success: true,
      message: 'Sector updated successfully',
      data: { sector }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Sector name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Delete sector
// @route   DELETE /api/sectors/:id
// @access  Private/Admin
const deleteSector = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findByPk(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sector not found' }
      });
    }

    // Check if sector has children (if hierarchical structure exists)
    const childrenCount = await Sector.count({
      where: { parentId: id }
    });

    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete sector with child sectors' }
      });
    }

    // Remove all incentive associations before deleting
    await sector.setIncentives([]);
    
    await sector.destroy();

    res.json({
      success: true,
      message: 'Sector deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sector tree (hierarchical structure)
// @route   GET /api/sectors/tree
// @access  Public
const getSectorTree = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const sectors = await Sector.findAll({
      where: { ...where, parentId: null },
      order: [['name', 'ASC']],
      include: [
        {
          model: Sector,
          as: 'children',
          where: isActive !== undefined ? { isActive: isActive === 'true' } : {},
          required: false,
          order: [['name', 'ASC']],
          include: [
            {
              model: Sector,
              as: 'children',
              where: isActive !== undefined ? { isActive: isActive === 'true' } : {},
              required: false,
              order: [['name', 'ASC']]
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: { sectors }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSectors,
  getSectorsWithIncentives,
  getSectorById,
  getSectorWithIncentives,
  createSector,
  createSectorWithIncentives,
  updateSector,
  updateSectorWithIncentives,
  updateSectorIncentives,
  deleteSector,
  getSectorTree
};