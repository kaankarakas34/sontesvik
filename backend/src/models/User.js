const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
      validate: {
        notEmpty: { msg: 'First name is required' },
        len: {
          args: [2, 50],
          msg: 'First name must be between 2 and 50 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
      validate: {
        notEmpty: { msg: 'Last name is required' },
        len: {
          args: [2, 50],
          msg: 'Last name must be between 2 and 50 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Email address already exists'
      },
      validate: {
        isEmail: { msg: 'Please provide a valid email address' },
        notEmpty: { msg: 'Email is required' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: {
          args: [8, 255],
          msg: 'Password must be at least 8 characters long'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[+]?[0-9\s\-\(\)]+$/,
          msg: 'Please provide a valid phone number'
        }
      }
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'company',
      field: 'role',
      validate: {
        isIn: {
          args: [['admin', 'company', 'consultant', 'member']],
          msg: 'Role must be admin, company, consultant, or member'
        }
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['active', 'inactive', 'pending', 'suspended']],
          msg: 'Status must be active, inactive, pending, or suspended'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'company_name'
    },
    companyTaxNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'company_tax_number'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Turkey'
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'email_verified'
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'email_verification_token'
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verification_expires'
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'password_reset_token'
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_reset_expires'
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at'
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'login_attempts'
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lock_until'
    },
    lastLoginIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'last_login_ip'
    },
    currentSessionToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'current_session_token'
    },
    sessionExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'session_expiry'
    },
    twoFactorSecret: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'two_factor_secret'
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'two_factor_enabled'
    },
    sector: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'other',
      validate: {
        isIn: {
          args: [[
            'technology',
            'manufacturing',
            'healthcare',
            'education',
            'finance',
            'construction',
            'agriculture',
            'tourism',
            'energy',
            'transportation',
            'food',
            'textile',
            'automotive',
            'chemicals',
            'mining',
            'telecommunications',
            'media',
            'consulting',
            'real_estate',
            'logistics',
            'retail',
            'other'
          ]],
          msg: 'Invalid sector selection'
        }
      }
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'approved_by'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at'
    },
    rejectedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'rejected_by'
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'rejected_at'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_active'
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_approved'
    },
    // Consultant specific fields
    consultantRating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: null,
      field: 'consultant_rating',
      validate: {
        min: 1.0,
        max: 5.0
      }
    },
    consultantReviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'consultant_review_count'
    },
    consultantBio: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'consultant_bio'
    },
    consultantSpecializations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'consultant_specializations'
    },
    consultantStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'busy', 'on_leave'),
      allowNull: false,
      defaultValue: 'inactive',
      field: 'consultant_status'
    },
    maxConcurrentApplications: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: 'max_concurrent_applications'
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'assigned_by'
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'assigned_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: false, // Soft delete disabled - users are permanent
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeDestroy: async (user) => {
        // Prevent deletion of ALL users - they are permanent entities
        throw new Error('Users cannot be deleted. All users are permanent entities in the system.');
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['sector']
      },
      {
        fields: ['approved_by']
      },
      {
        fields: ['approved_at']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeDestroy: async (user) => {
        // Prevent deletion of ALL users - they are permanent entities
        throw new Error('Users cannot be deleted. All users are permanent entities in the system.');
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    console.log('🔍 comparePassword - Candidate:', candidatePassword);
    console.log('🔍 comparePassword - Hash:', this.password);
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔍 comparePassword - Result:', result);
    return result;
  };

  User.prototype.generateAccessToken = function() {
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email, 
        role: this.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '48h' }
    );
  };

  User.prototype.generateRefreshToken = function() {
    return jwt.sign(
      { 
        id: this.id, 
        type: 'refresh' 
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
  };

  User.prototype.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return resetToken;
  };

  User.prototype.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
  };

  User.prototype.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  };

  // Consultant specific methods
  User.prototype.isConsultant = function() {
    return this.role === 'consultant';
  };

  User.prototype.canAcceptMoreApplications = function() {
    if (!this.isConsultant() || this.consultantStatus !== 'active') {
      return false;
    }
    return this.assignedApplications?.filter(app => app.status === 'pending').length < this.maxConcurrentApplications;
  };

  User.prototype.getActiveApplicationsCount = function() {
    if (!this.isConsultant()) {
      return 0;
    }
    return this.assignedApplications?.filter(app => ['pending', 'in_review', 'approved'].includes(app.status)).length || 0;
  };

  User.prototype.getAverageRating = function() {
    return this.consultantRating || 0;
  };

  User.prototype.updateRating = async function(newRating) {
    if (!this.isConsultant()) {
      throw new Error('Only consultants can have ratings');
    }
    
    const reviews = await this.getConsultantReviews();
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + newRating;
    const newAverage = totalRating / (reviews.length + 1);
    
    this.consultantRating = Math.round(newAverage * 100) / 100;
    this.consultantReviewCount = reviews.length + 1;
    
    return this.save();
  };

  User.prototype.incLoginAttempts = async function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.update({
        loginAttempts: 1,
        lockUntil: null
      });
    }

    const updates = { loginAttempts: this.loginAttempts + 1 };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
      updates.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    }

    return this.update(updates);
  };

  User.prototype.resetLoginAttempts = async function() {
    return this.update({
      loginAttempts: 0,
      lockUntil: null
    });
  };

  User.prototype.invalidateSession = async function() {
    return this.update({
      currentSessionToken: null,
      sessionExpiry: null
    });
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    delete values.emailVerificationToken;
    delete values.emailVerificationExpires;
    delete values.refreshToken;
    delete values.loginAttempts;
    delete values.lockUntil;
    return values;
  };

  User.associate = function(models) {
    // User associations with Ticket
    User.hasMany(models.Ticket, { foreignKey: 'userId', as: 'userTickets' }); // Changed alias from 'tickets' to 'userTickets'
    User.hasMany(models.Ticket, { foreignKey: 'consultantId', as: 'assignedTickets' });
    User.hasMany(models.TicketMessage, { foreignKey: 'senderId', as: 'sentMessages' });
    User.hasMany(models.Application, { foreignKey: 'userId', as: 'applications' });
    User.hasMany(models.Document, { foreignKey: 'userId', as: 'documents' });
    User.hasMany(models.Notification, { foreignKey: 'createdBy', as: 'notifications' });
    User.hasMany(models.IncentiveGuide, { foreignKey: 'createdBy', as: 'createdGuides' });
    User.hasMany(models.IncentiveGuide, { foreignKey: 'updatedBy', as: 'updatedGuides' });
    
    // Consultant specific associations
    User.hasMany(models.Application, { foreignKey: 'assignedConsultantId', as: 'assignedApplications' });
    User.hasMany(models.ConsultantReview, { foreignKey: 'consultantId', as: 'consultantReviews' });
    User.hasMany(models.ConsultantReview, { foreignKey: 'reviewerId', as: 'givenReviews' });
    User.hasMany(models.ConsultantAssignmentLog, { foreignKey: 'consultantId', as: 'assignmentLogs' });
    User.hasMany(models.ConsultantAssignmentLog, { foreignKey: 'assignedBy', as: 'assignedConsultants' });
    
    // Admin approval relationships
    User.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approvedByUser' });
    User.belongsTo(models.User, { foreignKey: 'rejectedBy', as: 'rejectedByUser' });
    User.belongsTo(models.User, { foreignKey: 'assignedBy', as: 'assignedByUser' });
  };

  return User;
};