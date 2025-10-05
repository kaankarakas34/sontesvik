const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IncentiveType = sequelize.define('IncentiveType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#3B82F6',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sectorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Sectors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    }
  }, {
    tableName: 'IncentiveTypes',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['sectorId']
      }
    ]
  });

  // Define associations
  IncentiveType.associate = function(models) {
    IncentiveType.belongsTo(models.Sector, {
      foreignKey: 'sectorId',
      as: 'sector'
    });
  };

  return IncentiveType;
};