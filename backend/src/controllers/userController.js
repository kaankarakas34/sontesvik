const { User, Application, Incentive } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filters
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;
    
    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { 
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken'] 
      },
      include: [
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'status'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalItems: users.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

    logger.info('Users list fetched successfully', {
      userId: req.user.id,
      userRole: req.user.role,
      filters: { role, status, search },
      pagination: { page, limit, total: users.count }
    });

  } catch (error) {
    logger.error('Error fetching users list', {
      userId: req.user.id,
      userRole: req.user.role,
      filters: { role, status, search },
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { 
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken'] 
      },
      include: [
        {
          model: Application,
          as: 'applications',
          include: [
            {
              model: Incentive,
              as: 'incentive',
              attributes: ['id', 'title']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      status,
      companyName,
      companyTaxNumber,
      address,
      city,
      sector
    } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updatedUser = await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phone: phone || user.phone,
      role: role || user.role,
      status: status || user.status,
      companyName: companyName || user.companyName,
      companyTaxNumber: companyTaxNumber || user.companyTaxNumber,
      address: address || user.address,
      city: city || user.city,
      sector: sector || user.sector
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { 
        user: {
          ...updatedUser.toJSON(),
          password: undefined,
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
          emailVerificationToken: undefined,
          emailVerificationExpires: undefined,
          refreshToken: undefined
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Prevent deletion of ALL users - users are permanent entities
    return res.status(403).json({
      success: false,
      message: 'Users cannot be deleted. All users are permanent entities in the system.'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    const pendingUsers = await User.count({ where: { status: 'pending' } });
    const inactiveUsers = await User.count({ where: { status: 'inactive' } });
    
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    const recentUsers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      attributes: { exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken'] },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          pendingUsers,
          inactiveUsers,
          usersByRole: usersByRole.map(item => ({
            role: item.role,
            count: parseInt(item.dataValues.count)
          }))
        },
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (for membership approval)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.id;

    // Validate status
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, inactive, pending, suspended'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare update data
    const updateData = { status };
    
    // Add approval/rejection metadata based on status
    if (status === 'active' && user.status === 'pending') {
      updateData.approvedBy = adminId;
      updateData.approvedAt = new Date();
    } else if (status === 'inactive' && user.status === 'pending') {
      updateData.rejectedBy = adminId;
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = reason || 'No reason provided';
    }

    await user.update(updateData);

    // Get updated user without sensitive data
    const updatedUser = await User.findByPk(id, {
      attributes: { 
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken'] 
      }
    });

    res.json({
      success: true,
      message: `User status updated to ${status} successfully`,
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending users for approval
// @route   GET /api/users/pending
// @access  Private/Admin
const getPendingUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const pendingUsers = await User.findAndCountAll({
      where: {
        status: 'pending',
        role: { [Op.in]: ['company', 'consultant'] }
      },
      attributes: {
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken']
      },
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users: pendingUsers.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(pendingUsers.count / limit),
          totalItems: pendingUsers.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk approve users
// @route   PUT /api/users/bulk-approve
// @access  Private/Admin
const bulkApproveUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    const adminId = req.user.id;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const users = await User.findAll({
      where: {
        id: { [Op.in]: userIds },
        status: 'pending'
      }
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pending users found with provided IDs'
      });
    }

    await User.update(
      {
        status: 'active',
        approvedBy: adminId,
        approvedAt: new Date()
      },
      {
        where: {
          id: { [Op.in]: userIds },
          status: 'pending'
        }
      }
    );

    res.json({
      success: true,
      message: `${users.length} users approved successfully`,
      data: { approvedCount: users.length }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      status,
      companyName,
      companyTaxNumber,
      address,
      city,
      sector
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed by the model's beforeCreate hook
      phone,
      role: role || 'company',
      status: status || 'active',
      companyName,
      companyTaxNumber,
      address,
      city,
      sector,
      emailVerified: true, // Admin created users are automatically verified
      createdBy: req.user.id
    });

    // Return user without password
    const userResponse = await User.findByPk(user.id, {
      attributes: { 
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken'] 
      }
    });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all companies
// @route   GET /api/users/companies
// @access  Private/Admin
const getCompanies = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search,
      sortBy = 'companyName',
      sortOrder = 'ASC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {
      role: 'company',
      companyName: { [Op.ne]: null }
    };

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { companyName: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const companies = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'phone', 'status',
        'companyName', 'companyTaxNumber', 'address', 'city', 'sector', 'createdAt'
      ],
      include: [
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'status'],
          required: false
        }
      ]
    });

    // Group by company name and get company stats
    const companyStats = {};
    companies.rows.forEach(company => {
      const companyName = company.companyName;
      if (!companyStats[companyName]) {
        companyStats[companyName] = {
          companyName,
          totalUsers: 0,
          activeUsers: 0,
          pendingUsers: 0,
          totalApplications: 0,
          city: company.city,
          sector: company.sector,
          users: []
        };
      }
      
      companyStats[companyName].totalUsers++;
      if (company.status === 'active') companyStats[companyName].activeUsers++;
      if (company.status === 'pending') companyStats[companyName].pendingUsers++;
      companyStats[companyName].totalApplications += company.applications?.length || 0;
      companyStats[companyName].users.push({
        id: company.id,
        firstName: company.firstName,
        lastName: company.lastName,
        email: company.email,
        phone: company.phone,
        status: company.status,
        createdAt: company.createdAt
      });
    });

    const companiesList = Object.values(companyStats);

    res.json({
      success: true,
      data: {
        companies: companiesList,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(companies.count / limit),
          totalItems: companies.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company details with users
// @route   GET /api/users/companies/:companyName
// @access  Private/Admin
const getCompanyDetails = async (req, res, next) => {
  try {
    const { companyName } = req.params;
    const { 
      page = 1, 
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {
      role: 'company',
      companyName: { [Op.iLike]: companyName }
    };

    if (status) whereClause.status = status;

    const companyUsers = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: { 
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken'] 
      },
      include: [
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'status', 'createdAt'],
          required: false
        }
      ]
    });

    if (companyUsers.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get company summary from first user
    const firstUser = companyUsers.rows[0];
    const companySummary = {
      companyName: firstUser.companyName,
      companyTaxNumber: firstUser.companyTaxNumber,
      address: firstUser.address,
      city: firstUser.city,
      sector: firstUser.sector,
      totalUsers: companyUsers.count,
      activeUsers: companyUsers.rows.filter(u => u.status === 'active').length,
      pendingUsers: companyUsers.rows.filter(u => u.status === 'pending').length,
      totalApplications: companyUsers.rows.reduce((sum, u) => sum + (u.applications?.length || 0), 0)
    };

    res.json({
      success: true,
      data: {
        company: companySummary,
        users: companyUsers.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(companyUsers.count / limit),
          totalItems: companyUsers.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company
// @route   POST /api/users/companies
// @access  Private/Admin
const createCompany = async (req, res, next) => {
  try {
    const {
      companyName,
      companyTaxNumber,
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      city,
      sector,
      status = 'active'
    } = req.body;

    // Validate required company fields
    if (!companyName || !companyTaxNumber) {
      return res.status(400).json({
        success: false,
        message: 'Company name and tax number are required'
      });
    }

    // Check if company with same tax number already exists
    const existingCompany = await User.findOne({ 
      where: { 
        companyTaxNumber,
        role: 'company'
      } 
    });
    
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'A company with this tax number already exists'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email address already exists'
      });
    }

    // Create company user
    const companyUser = await User.create({
      firstName: firstName || companyName,
      lastName: lastName || 'Ltd. Şti.',
      email,
      password,
      phone,
      role: 'company',
      status,
      companyName,
      companyTaxNumber,
      address,
      city,
      sector: sector || 'other',
      emailVerified: true, // Admin created companies are automatically verified
      isApproved: true, // Companies are permanent and approved by default
      createdBy: req.user.id
    });

    // Return company user without sensitive data
    const companyResponse = await User.findByPk(companyUser.id, {
      attributes: { 
        exclude: ['password', 'passwordResetToken', 'passwordResetExpires', 'emailVerificationToken', 'emailVerificationExpires', 'refreshToken'] 
      }
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully. Companies are permanent entities and cannot be deleted.',
      data: companyResponse
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserStatus,
  getPendingUsers,
  bulkApproveUsers,
  getCompanies,
  getCompanyDetails,
  createCompany
};