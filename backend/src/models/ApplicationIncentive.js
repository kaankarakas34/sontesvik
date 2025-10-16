const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApplicationIncentive = sequelize.define('ApplicationIncentive', {
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
    incentiveId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'incentive_id',
      references: {
        model: 'incentives',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'ApplicationIncentives',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['application_id']
      },
      {
        fields: ['incentive_id']
      },
      {
        fields: ['application_id', 'incentive_id'],
        unique: true
      }
    ]
  });

  ApplicationIncentive.associate = function(models) {
    ApplicationIncentive.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });
    
    ApplicationIncentive.belongsTo(models.Incentive, {
      foreignKey: 'incentiveId',
      as: 'incentive'
    });
  };

  return ApplicationIncentive;
};