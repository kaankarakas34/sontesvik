const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IncentiveDocument = sequelize.define('IncentiveDocument', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    incentiveId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'incentive_id',
      references: {
        model: 'Incentives',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    documentTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'document_type_id',
      references: {
        model: 'DocumentTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_required',
      comment: 'Whether this document is required for this specific incentive'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Specific description for this document in context of this incentive'
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description_en',
      comment: 'English description for this document in context of this incentive'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
      validate: {
        min: 0
      },
      comment: 'Order of documents for this incentive'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'IncentiveDocuments',
    timestamps: true,
    indexes: [
      {
        fields: ['incentive_id']
      },
      {
        fields: ['document_type_id']
      },
      {
        fields: ['incentive_id', 'document_type_id'],
        unique: true,
        name: 'unique_incentive_document'
      },
      {
        fields: ['is_required']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['sort_order']
      }
    ]
  });

  return IncentiveDocument;
};