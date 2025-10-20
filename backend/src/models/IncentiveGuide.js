const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IncentiveGuide = sequelize.define('IncentiveGuide', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    incentiveId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'incentive_id',
      references: {
        model: 'incentives',
        key: 'id'
      },
      validate: {
        notEmpty: { msg: 'Incentive ID is required' }
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title is required' },
        len: {
          args: [1, 255],
          msg: 'Title must be between 1 and 255 characters'
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Content is required' }
      }
    },
    regulations: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requiredDocuments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'requiredDocuments',
      validate: {
        isValidDocuments(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Required documents must be an array');
          }
        }
      }
    },
    applicationSteps: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'applicationSteps',
      validate: {
        isValidSteps(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Application steps must be an array');
          }
        }
      }
    },
    eligibilityCriteria: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'eligibilityCriteria',
      validate: {
        isValidCriteria(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Eligibility criteria must be an object');
          }
        }
      }
    },
    deadlines: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      validate: {
        isValidDeadlines(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Deadlines must be an object');
          }
        }
      }
    },
    contactInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'contactInfo',
      validate: {
        isValidContact(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Contact info must be an object');
          }
        }
      }
    },
    faqs: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidFaqs(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('FAQs must be an array');
          }
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [1],
          msg: 'Version must be at least 1'
        }
      }
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'published_at'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'updated_by',
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'incentive_guides',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['incentive_id']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['published_at']
      },
      {
        fields: ['version']
      }
    ]
  });

  // Instance methods
  IncentiveGuide.prototype.publish = function() {
    return this.update({
      publishedAt: new Date(),
      isActive: true
    });
  };

  IncentiveGuide.prototype.unpublish = function() {
    return this.update({
      publishedAt: null,
      isActive: false
    });
  };

  // Define associations
  IncentiveGuide.associate = function(models) {
    IncentiveGuide.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    IncentiveGuide.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
    
    IncentiveGuide.belongsTo(models.Incentive, {
      foreignKey: 'incentiveId',
      as: 'incentive'
    });
  };

  return IncentiveGuide;
};