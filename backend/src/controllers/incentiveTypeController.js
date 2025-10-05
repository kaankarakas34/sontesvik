const { IncentiveType } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all incentive types
// @route   GET /api/incentive-types
// @access  Public
const getIncentiveTypes = async (req, res, next) => {
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

    // Include sector information
    const { count, rows: incentiveTypes } = await IncentiveType.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      include: [{
        model: require('../models').Sector,
        as: 'sector',
        attributes: ['id', 'name', 'code']
      }]
    });

    res.json({
      success: true,
      data: {
        incentiveTypes,
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

// @desc    Get incentive type by ID
// @route   GET /api/incentive-types/:id
// @access  Public
const getIncentiveTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const incentiveType = await IncentiveType.findByPk(id);

    if (!incentiveType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Incentive type not found' }
      });
    }

    res.json({
      success: true,
      data: { incentiveType }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new incentive type
// @route   POST /api/incentive-types
// @access  Private/Admin
const createIncentiveType = async (req, res, next) => {
  try {
    const {
      name,
      nameEn,
      code,
      description,
      descriptionEn,
      sortOrder = 0,
      isActive = true,
      icon,
      color
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Incentive type name is required' }
      });
    }

    const incentiveType = await IncentiveType.create({
      name,
      nameEn,
      code,
      description,
      descriptionEn,
      sortOrder,
      isActive,
      icon,
      color
    });

    res.status(201).json({
      success: true,
      message: 'Incentive type created successfully',
      data: { incentiveType }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Incentive type name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Update incentive type
// @route   PUT /api/incentive-types/:id
// @access  Private/Admin
const updateIncentiveType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      nameEn,
      code,
      description,
      descriptionEn,
      sortOrder,
      isActive,
      icon,
      color
    } = req.body;

    const incentiveType = await IncentiveType.findByPk(id);
    if (!incentiveType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Incentive type not found' }
      });
    }

    await incentiveType.update({
      name: name || incentiveType.name,
      nameEn: nameEn !== undefined ? nameEn : incentiveType.nameEn,
      code: code !== undefined ? code : incentiveType.code,
      description: description !== undefined ? description : incentiveType.description,
      descriptionEn: descriptionEn !== undefined ? descriptionEn : incentiveType.descriptionEn,
      sortOrder: sortOrder !== undefined ? sortOrder : incentiveType.sortOrder,
      isActive: isActive !== undefined ? isActive : incentiveType.isActive,
      icon: icon !== undefined ? icon : incentiveType.icon,
      color: color !== undefined ? color : incentiveType.color
    });

    res.json({
      success: true,
      message: 'Incentive type updated successfully',
      data: { incentiveType }
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: { message: 'Incentive type name or code already exists' }
      });
    }
    next(error);
  }
};

// @desc    Delete incentive type
// @route   DELETE /api/incentive-types/:id
// @access  Private/Admin
const deleteIncentiveType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const incentiveType = await IncentiveType.findByPk(id);
    if (!incentiveType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Incentive type not found' }
      });
    }

    // Check if incentive type is being used by any incentives
    const { Incentive } = require('../models');
    const incentiveCount = await Incentive.count({
      where: { incentiveType: id }
    });

    if (incentiveCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete incentive type that is being used by incentives' }
      });
    }

    await incentiveType.destroy();

    res.json({
      success: true,
      message: 'Incentive type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle incentive type status
// @route   PATCH /api/incentive-types/:id/toggle-status
// @access  Private/Admin
const toggleIncentiveTypeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const incentiveType = await IncentiveType.findByPk(id);
    if (!incentiveType) {
      return res.status(404).json({
        success: false,
        error: { message: 'Incentive type not found' }
      });
    }

    await incentiveType.update({
      isActive: !incentiveType.isActive
    });

    res.json({
      success: true,
      message: `Incentive type ${incentiveType.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { incentiveType }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncentiveTypes,
  getIncentiveTypeById,
  createIncentiveType,
  updateIncentiveType,
  deleteIncentiveType,
  toggleIncentiveTypeStatus
};