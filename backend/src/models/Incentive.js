const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Incentive = sequelize.define('Incentive', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Title is required' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    incentiveType: {
      type: DataTypes.ENUM('grant', 'loan', 'tax_exemption', 'support'),
      allowNull: false,
      field: 'incentive_type',
      validate: {
        isIn: {
          args: [['grant', 'loan', 'tax_exemption', 'support']],
          msg: 'Invalid incentive type'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired', 'planned'),
      allowNull: false,
      defaultValue: 'planned',
      validate: {
        isIn: {
          args: [['active', 'inactive', 'expired', 'planned']],
          msg: 'Invalid status'
        }
      }
    },
    provider: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    providerType: {
      type: DataTypes.ENUM('government', 'private', 'ngo', 'international'),
      allowNull: false,
      field: 'provider_type',
      validate: {
        isIn: {
          args: [['government', 'private', 'ngo', 'international']],
          msg: 'Invalid provider type'
        }
      }
    },
    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'application_deadline'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date'
    },
    maxAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'max_amount'
    },
    minAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'min_amount'
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'TRY'
    },
    eligibilityCriteria: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'eligibility_criteria'
    },
    requiredDocuments: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'required_documents'
    },
    applicationUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'application_url',
      validate: {
        isUrl: { msg: 'Invalid URL format' }
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'view_count'
    },
    applicationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'application_count'
    },
    completionRate: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      field: 'completion_rate'
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Turkey'
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
    tableName: 'incentives',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['incentive_type']
      },
      {
        fields: ['provider_type']
      },
      {
        fields: ['region']
      },
      {
        fields: ['country']
      }
    ]
  });

  Incentive.associate = function(models) {
    Incentive.belongsToMany(models.Sector, {
      through: 'SectorIncentive',
      foreignKey: 'incentive_id',
      otherKey: 'sector_id'
    });
    
    Incentive.hasOne(models.IncentiveGuide, {
      foreignKey: 'incentiveId',
      as: 'guide'
    });

    // Incentive has many Applications
    Incentive.hasMany(models.Application, {
      foreignKey: 'incentiveId',
      as: 'applications'
    });
  };

  return Incentive;
};