const { Membership, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get all memberships
// @route   GET /api/memberships
// @access  Admin only
const getAllMemberships = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, companyName } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    let userWhereClause = {};

    // Filter by payment status
    if (status) {
      whereClause.paymentStatus = status;
    }

    // Filter by company name
    if (companyName) {
      userWhereClause.companyName = {
        [Op.iLike]: `%${companyName}%`
      };
    }

    const { count, rows: memberships } = await Membership.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'company',
        attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'companyTaxNumber', 'city'],
        where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        memberships,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all memberships error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// @desc    Get membership by ID
// @route   GET /api/memberships/:id
// @access  Admin only
const getMembershipById = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findByPk(id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'companyTaxNumber', 'city']
      }]
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: { message: 'Membership not found' }
      });
    }

    res.json({
      success: true,
      data: membership
    });
  } catch (error) {
    logger.error('Get membership by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// @desc    Create new membership
// @route   POST /api/memberships
// @access  Admin only
const createMembership = async (req, res) => {
  try {
    const { companyId, startDate, endDate, monthlyFee, paymentStatus = 'pending' } = req.body;

    // Validate required fields
    if (!companyId || !startDate || !endDate || !monthlyFee) {
      return res.status(400).json({
        success: false,
        error: { message: 'Company ID, start date, end date, and monthly fee are required' }
      });
    }

    // Check if company exists
    const company = await User.findByPk(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { message: 'Company not found' }
      });
    }

    // Check for overlapping memberships
    const existingMembership = await Membership.findOne({
      where: {
        companyId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            endDate: {
              [Op.between]: [startDate, endDate]
            }
          },
          {
            [Op.and]: [
              { startDate: { [Op.lte]: startDate } },
              { endDate: { [Op.gte]: endDate } }
            ]
          }
        ]
      }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: { message: 'Overlapping membership period exists for this company' }
      });
    }

    const membership = await Membership.create({
      companyId,
      startDate,
      endDate,
      monthlyFee,
      paymentStatus
    });

    // Fetch the created membership with company details
    const createdMembership = await Membership.findByPk(membership.id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'companyTaxNumber', 'city']
      }]
    });

    logger.info(`Membership created for company ${companyId}`, { membershipId: membership.id });

    res.status(201).json({
      success: true,
      data: createdMembership
    });
  } catch (error) {
    logger.error('Create membership error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// @desc    Update membership
// @route   PUT /api/memberships/:id
// @access  Admin only
const updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, monthlyFee, paymentStatus } = req.body;

    const membership = await Membership.findByPk(id);
    if (!membership) {
      return res.status(404).json({
        success: false,
        error: { message: 'Membership not found' }
      });
    }

    // Check for overlapping memberships if dates are being updated
    if (startDate || endDate) {
      const newStartDate = startDate || membership.startDate;
      const newEndDate = endDate || membership.endDate;

      const existingMembership = await Membership.findOne({
        where: {
          id: { [Op.ne]: id }, // Exclude current membership
          companyId: membership.companyId,
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [newStartDate, newEndDate]
              }
            },
            {
              endDate: {
                [Op.between]: [newStartDate, newEndDate]
              }
            },
            {
              [Op.and]: [
                { startDate: { [Op.lte]: newStartDate } },
                { endDate: { [Op.gte]: newEndDate } }
              ]
            }
          ]
        }
      });

      if (existingMembership) {
        return res.status(400).json({
          success: false,
          error: { message: 'Overlapping membership period exists for this company' }
        });
      }
    }

    // Update membership
    await membership.update({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(monthlyFee && { monthlyFee }),
      ...(paymentStatus && { paymentStatus })
    });

    // Fetch updated membership with company details
    const updatedMembership = await Membership.findByPk(id, {
      include: [{
        model: User,
        as: 'company',
        attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'companyTaxNumber', 'city']
      }]
    });

    logger.info(`Membership updated`, { membershipId: id });

    res.json({
      success: true,
      data: updatedMembership
    });
  } catch (error) {
    logger.error('Update membership error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// @desc    Delete membership
// @route   DELETE /api/memberships/:id
// @access  Admin only
const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findByPk(id);
    if (!membership) {
      return res.status(404).json({
        success: false,
        error: { message: 'Membership not found' }
      });
    }

    await membership.destroy();

    logger.info(`Membership deleted`, { membershipId: id });

    res.json({
      success: true,
      message: 'Membership deleted successfully'
    });
  } catch (error) {
    logger.error('Delete membership error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// @desc    Get membership statistics
// @route   GET /api/memberships/stats
// @access  Admin only
const getMembershipStats = async (req, res) => {
  try {
    const totalMemberships = await Membership.count();
    const activeMemberships = await Membership.count({
      where: {
        endDate: { [Op.gte]: new Date() },
        startDate: { [Op.lte]: new Date() }
      }
    });
    const expiredMemberships = await Membership.count({
      where: {
        endDate: { [Op.lt]: new Date() }
      }
    });
    const pendingPayments = await Membership.count({
      where: {
        paymentStatus: 'pending'
      }
    });
    const overduePayments = await Membership.count({
      where: {
        paymentStatus: 'overdue'
      }
    });

    // Calculate total monthly revenue
    const activeRevenue = await Membership.sum('monthlyFee', {
      where: {
        endDate: { [Op.gte]: new Date() },
        startDate: { [Op.lte]: new Date() },
        paymentStatus: 'paid'
      }
    });

    res.json({
      success: true,
      data: {
        totalMemberships,
        activeMemberships,
        expiredMemberships,
        pendingPayments,
        overduePayments,
        activeRevenue: activeRevenue || 0
      }
    });
  } catch (error) {
    logger.error('Get membership stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// @desc    Get memberships by company ID
// @route   GET /api/memberships/company/:companyId
// @access  Admin only
const getMembershipsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const memberships = await Membership.findAll({
      where: { companyId },
      include: [{
        model: User,
        as: 'company',
        attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'companyTaxNumber', 'city']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: memberships
    });
  } catch (error) {
    logger.error('Get memberships by company error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

module.exports = {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
  getMembershipStats,
  getMembershipsByCompany
};