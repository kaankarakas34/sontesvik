const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'application_number',
      validate: {
        notEmpty: { msg: 'Application number is required' }
      }
    },
    status: {
      type: DataTypes.ENUM(
        'draft',
        'submitted',
        'under_review',
        'additional_info_required',
        'approved',
        'rejected',
        'cancelled',
        'completed'
      ),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: {
          args: [[
            'draft',
            'submitted',
            'under_review',
            'additional_info_required',
            'approved',
            'rejected',
            'cancelled',
            'completed'
          ]],
          msg: 'Invalid application status'
        }
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: {
          args: [['low', 'medium', 'high', 'urgent']],
          msg: 'Priority must be low, medium, high, or urgent'
        }
      }
    },
    requestedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'requested_amount',
      validate: {
        min: {
          args: [0],
          msg: 'Requested amount cannot be negative'
        }
      }
    },
    approvedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'approved_amount',
      validate: {
        min: {
          args: [0],
          msg: 'Approved amount cannot be negative'
        }
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'TRY',
      validate: {
        len: {
          args: [3, 3],
          msg: 'Currency must be 3 characters'
        }
      }
    },
    projectTitle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'project_title',
      validate: {
        len: {
          args: [0, 200],
          msg: 'Project title cannot exceed 200 characters'
        }
      }
    },
    projectDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'project_description'
    },
    completionPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'completion_percentage',
      validate: {
        min: {
          args: [0],
          msg: 'Completion percentage cannot be negative'
        },
        max: {
          args: [100],
          msg: 'Completion percentage cannot exceed 100'
        }
      }
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'submitted_at'
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at'
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
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    incentiveId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'incentive_id',
      references: {
        model: 'incentives',
        key: 'id'
      }
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reviewed_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'approved_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedConsultantId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'assigned_consultant_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    consultantAssignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'consultant_assigned_at'
    },
    consultantAssignmentType: {
      type: DataTypes.ENUM('manual', 'automatic'),
      allowNull: true,
      field: 'consultant_assignment_type'
    },
    consultantNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'consultant_notes'
    },
    consultantRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'consultant_rating',
      validate: {
        min: 1,
        max: 5
      }
    },
    consultantReview: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'consultant_review'
    }
  }, {
    tableName: 'Applications',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['application_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['incentive_id']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['reviewed_at']
      },
      {
        fields: ['approved_at']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: async (application) => {
        if (!application.applicationNumber) {
          // Generate application number
          const count = await Application.count();
          const year = new Date().getFullYear();
          application.applicationNumber = `APP-${year}-${String(count + 1).padStart(6, '0')}`;
        }
      }
    }
  });

  // Instance methods
  Application.prototype.canBeEdited = function() {
    return ['draft', 'additional_info_required'].includes(this.status);
  };

  Application.prototype.canBeSubmitted = function() {
    return this.status === 'draft';
  };

  Application.prototype.canBeCancelled = function() {
    return ['draft', 'submitted', 'under_review', 'additional_info_required'].includes(this.status);
  };

  Application.prototype.isInReview = function() {
    return this.status === 'under_review';
  };

  Application.prototype.isCompleted = function() {
    return ['approved', 'rejected', 'cancelled'].includes(this.status);
  };

  Application.prototype.getDaysInCurrentStatus = function() {
    const statusDate = this.submittedAt || this.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now - statusDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Class methods
  Application.findByStatus = function(status, options = {}) {
    return this.findAll({
      where: { status },
      ...options
    });
  };

  Application.findByUser = function(userId, options = {}) {
    return this.findAll({
      where: { userId },
      ...options
    });
  };

  Application.findPending = function(options = {}) {
    return this.findAll({
      where: {
        status: ['submitted', 'under_review', 'additional_info_required']
      },
      ...options
    });
  };

  Application.findUrgent = function(options = {}) {
    return this.findAll({
      where: {
        priority: 'urgent',
        status: ['submitted', 'under_review']
      },
      ...options
    });
  };

  // Define associations
  Application.associate = function(models) {
    // Application belongs to User
    Application.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Application belongs to Incentive
    Application.belongsTo(models.Incentive, {
      foreignKey: 'incentiveId',
      as: 'incentive'
    });

    // Application belongs to User (reviewer)
    Application.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer'
    });

    // Application belongs to User (approver)
    Application.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    // Application belongs to Consultant
    Application.belongsTo(models.User, {
      foreignKey: 'assignedConsultantId',
      as: 'assignedConsultant'
    });

    // Application has many Documents
    Application.hasMany(models.Document, {
      foreignKey: 'applicationId',
      as: 'documents'
    });

    // Application has many ConsultantAssignmentLogs
    Application.hasMany(models.ConsultantAssignmentLog, {
      foreignKey: 'applicationId',
      as: 'assignmentLogs'
    });

    // Application has one ConsultantReview
    Application.hasOne(models.ConsultantReview, {
      foreignKey: 'applicationId',
      as: 'consultantReviewData'
    });

    // Application has one ApplicationRoom
    Application.hasOne(models.ApplicationRoom, {
      foreignKey: 'applicationId',
      as: 'room'
    });
  };

  return Application;
};