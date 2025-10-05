const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DocumentIncentiveMapping = sequelize.define('DocumentIncentiveMapping', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    documentTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'DocumentTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    incentiveTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'IncentiveTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Bu belge türü bu teşvik için zorunlu mu?'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Bu eşleştirme için özel açıklama'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Belgelerin sıralama düzeni'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Bu eşleştirme aktif mi?'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'DocumentIncentiveMappings',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['documentTypeId', 'incentiveTypeId'],
        name: 'unique_document_incentive_mapping'
      },
      {
        fields: ['documentTypeId']
      },
      {
        fields: ['incentiveTypeId']
      },
      {
        fields: ['isRequired']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['sortOrder']
      }
    ]
  });

  // Define associations
  DocumentIncentiveMapping.associate = function(models) {
    DocumentIncentiveMapping.belongsTo(models.DocumentType, {
      foreignKey: 'documentTypeId',
      as: 'documentType'
    });

    DocumentIncentiveMapping.belongsTo(models.IncentiveType, {
      foreignKey: 'incentiveTypeId',
      as: 'incentiveType'
    });

    DocumentIncentiveMapping.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    DocumentIncentiveMapping.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

  return DocumentIncentiveMapping;
};