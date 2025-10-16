const { User, Application, Incentive } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Admin Dashboard Stats
const getAdminDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    const pendingUsers = await User.count({ where: { status: 'pending' } });
    const consultants = await User.count({ where: { role: 'consultant' } });
    const companies = await User.count({ where: { role: 'company' } });

    // Get application statistics
    const totalApplications = await Application.count();
    const pendingApplications = await Application.count({
      where: { status: ['submitted', 'under_review'] }
    });
    const approvedApplications = await Application.count({
      where: { status: 'approved' }
    });
    const rejectedApplications = await Application.count({
      where: { status: 'rejected' }
    });

    // Get incentive statistics
    const totalIncentives = await Incentive.count();
    const activeIncentives = await Incentive.count({ where: { status: 'active' } });
    const draftIncentives = await Incentive.count({ where: { status: 'planned' } });

    // Get total approved amount
    const totalApprovedAmount = await Application.sum('approvedAmount', {
      where: { status: 'approved' }
    }) || 0;

    // Get recent activities (last 10 applications)
    const recentApplications = await Application.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['title']
        }
      ]
    });

    // Get monthly application trends (last 12 months) - Simplified version
    const monthlyTrends = await Application.findAll({
      attributes: [
        'createdAt'
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
        }
      },
      raw: true
    });

    // Process monthly trends in JavaScript
    const monthlyTrendsProcessed = monthlyTrends.reduce((acc, app) => {
      const month = new Date(app.createdAt).toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyTrendsArray = Object.entries(monthlyTrendsProcessed)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data: {
        userStats: {
          totalUsers,
          activeUsers,
          pendingUsers,
          consultants,
          companies
        },
        applicationStats: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          totalApprovedAmount
        },
        incentiveStats: {
          totalIncentives,
          activeIncentives,
          draftIncentives
        },
        recentApplications,
        monthlyTrends: monthlyTrendsArray
      }
    });

    logger.info('Admin dashboard stats fetched successfully', {
      userId: req.user.id,
      userRole: req.user.role,
      stats: {
        totalUsers,
        totalApplications,
        totalIncentives,
        totalApprovedAmount
      }
    });

  } catch (error) {
    logger.error('Admin dashboard stats error', {
      userId: req.user.id,
      userRole: req.user.role,
      error: error.message,
      stack: error.stack
    });
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Consultant Dashboard Stats
const getConsultantDashboardStats = async (req, res) => {
  try {
    const consultantId = req.user.id;

    // Get consultant's client statistics (simplified - all members for now)
    const totalClients = await User.count({
      where: { 
        role: 'member'
      }
    });

    const activeClients = await User.count({
      where: { 
        role: 'member',
        status: 'active'
      }
    });

    // Get consultant's application statistics (simplified - all applications for now)
    const totalApplications = await Application.count();

    const pendingApplications = await Application.count({
      where: { 
        status: ['submitted', 'under_review']
      }
    });

    const approvedApplications = await Application.count({
      where: { 
        status: 'approved'
      }
    });

    const rejectedApplications = await Application.count({
      where: { 
        status: 'rejected'
      }
    });

    // Get total approved amount for consultant's applications
    const totalApprovedAmount = await Application.sum('approved_amount', {
      where: { 
        status: 'approved'
      }
    }) || 0;

    // Get consultant's recent applications
    const recentApplications = await Application.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'companyName']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['title', 'incentiveType']
        }
      ]
    });

    // Get consultant's clients (simplified - recent members)
    const clients = await User.findAll({
      where: { 
        role: 'member'
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'companyName', 'status', 'created_at'],
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    // Get monthly performance (last 6 months)
    const monthlyPerformance = await Application.findAll({
      attributes: [
        [Sequelize.fn('TO_CHAR', Sequelize.col('created_at'), 'YYYY-MM'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'applications'],
        [Sequelize.fn('SUM', Sequelize.col('approved_amount')), 'approvedAmount']
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      },
      group: [Sequelize.fn('TO_CHAR', Sequelize.col('created_at'), 'YYYY-MM')],
      order: [[Sequelize.fn('TO_CHAR', Sequelize.col('created_at'), 'YYYY-MM'), 'ASC']]
    });

    res.json({
      success: true,
      data: {
        clientStats: {
          totalClients,
          activeClients
        },
        applicationStats: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          totalApprovedAmount
        },
        recentApplications,
        clients,
        monthlyPerformance
      }
    });
  } catch (error) {
    console.error('Consultant dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Member Dashboard Stats
const getMemberDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get member's application statistics
    const totalApplications = await Application.count({
      where: { userId: userId }
    });

    const pendingApplications = await Application.count({
      where: { 
        userId: userId,
        status: ['submitted', 'under_review']
      }
    });

    const approvedApplications = await Application.count({
      where: { 
        userId: userId,
        status: 'approved'
      }
    });

    const rejectedApplications = await Application.count({
      where: { 
        userId: userId,
        status: 'rejected'
      }
    });

    // Get total approved amount for member's applications
    const totalApprovedAmount = await Application.sum('approved_amount', {
      where: { 
        userId: userId,
        status: 'approved'
      }
    }) || 0;

    // Get member's recent applications
    const recentApplications = await Application.findAll({
      where: { userId: userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['title', 'incentiveType']
        }
      ]
    });

    // Get recommended incentives based on user's profile/industry
    const recommendedIncentives = await Incentive.findAll({
      where: { 
        status: 'active',
        applicationDeadline: {
          [Op.gte]: new Date()
        }
      },
      limit: 5,
      order: [['created_at', 'DESC']]
    });

    // Get application status distribution
    const statusDistribution = await Application.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: { userId: userId },
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        applicationStats: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          totalApprovedAmount
        },
        recentApplications,
        recommendedIncentives,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Member dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Dashboard Data Based on User Role
const getDashboardData = async (req, res) => {
  try {
    const userRole = req.user.role;

    switch (userRole) {
      case 'admin':
        return await getAdminDashboardStats(req, res);
      case 'consultant':
        return await getConsultantDashboardStats(req, res);
      case 'member':
        return await getMemberDashboardStats(req, res);
      default:
        return res.status(403).json({
          success: false,
          message: 'Access denied: Invalid user role'
        });
    }
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Recent Activities (for all roles)
const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const limit = parseInt(req.query.limit) || 10;

    let whereCondition = {};
    
    if (userRole === 'member') {
      whereCondition.userId = userId;
    }
    // For consultant and admin, show all activities
    // Admin can see all activities, so no where condition needed

    const activities = await Application.findAll({
      where: whereCondition,
      limit,
      order: [['updated_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        },
        {
          model: Incentive,
          as: 'incentive',
          attributes: ['title']
        }
      ]
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAdminDashboardStats,
  getConsultantDashboardStats,
  getMemberDashboardStats,
  getDashboardData,
  getRecentActivities
};