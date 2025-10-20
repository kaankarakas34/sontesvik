const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConsultantAssignmentLog = sequelize.define('ConsultantAssignmentLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    consultantId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'consultant_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'assigned_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignmentType: {
      type: DataTypes.ENUM,
      values: ['manual', 'automatic'],
      allowNull: false,
      field: 'assignment_type'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sector: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'sector'
    },
    previousConsultantId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'previous_consultant_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    unassignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'unassigned_at'
    },
    unassignedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'unassigned_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    unassignmentReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'unassignment_reason'
    }
  }, {
    tableName: 'consultant_assignment_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['application_id']
      },
      {
        fields: ['consultant_id']
      },
      {
        fields: ['assigned_by']
      },
      {
        fields: ['assignment_type']
      },
      {
        fields: ['sector']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Instance methods
  ConsultantAssignmentLog.prototype.isActive = function() {
    return !this.unassignedAt;
  };

  ConsultantAssignmentLog.prototype.getDuration = function() {
    const endTime = this.unassignedAt || new Date();
    return endTime - this.createdAt;
  };

  // Class methods
  ConsultantAssignmentLog.findActiveAssignments = function(consultantId) {
    return this.findAll({
      where: {
        consultantId,
        unassignedAt: null
      }
    });
  };

  ConsultantAssignmentLog.findByApplication = function(applicationId) {
    return this.findAll({
      where: { applicationId },
      order: [['createdAt', 'DESC']]
    });
  };

  ConsultantAssignmentLog.findByConsultant = function(consultantId, options = {}) {
    return this.findAll({
      where: { consultantId },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  ConsultantAssignmentLog.getAssignmentStats = async function(consultantId, startDate, endDate) {
    const whereClause = {
      consultantId,
      createdAt: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      }
    };

    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        'assignment_type',
        [sequelize.Sequelize.fn('COUNT', '*'), 'count'],
        [sequelize.Sequelize.fn('AVG', sequelize.Sequelize.literal('CASE WHEN unassigned_at IS NOT NULL THEN EXTRACT(EPOCH FROM (unassigned_at - created_at))/3600 END')), 'avg_hours']
      ],
      group: ['assignment_type']
    });

    return stats;
  };

  // Define associations
  ConsultantAssignmentLog.associate = function(models) {
    // ConsultantAssignmentLog belongs to Application
    ConsultantAssignmentLog.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });

    // ConsultantAssignmentLog belongs to Consultant (User)
    ConsultantAssignmentLog.belongsTo(models.User, {
      foreignKey: 'consultantId',
      as: 'consultant'
    });

    // ConsultantAssignmentLog belongs to Assigner (User)
    ConsultantAssignmentLog.belongsTo(models.User, {
      foreignKey: 'assignedBy',
      as: 'assignedByUser'
    });

    // ConsultantAssignmentLog belongs to Previous Consultant (User)
    ConsultantAssignmentLog.belongsTo(models.User, {
      foreignKey: 'previousConsultantId',
      as: 'previousConsultant'
    });

    // ConsultantAssignmentLog belongs to Unassigner (User)
    ConsultantAssignmentLog.belongsTo(models.User, {
      foreignKey: 'unassignedBy',
      as: 'unassignedByUser'
    });
  };

  return ConsultantAssignmentLog;
};