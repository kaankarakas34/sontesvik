const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DocumentType = sequelize.define('DocumentType', {
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
    nameEn: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        len: [0, 20]
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
    category: {
      type: DataTypes.ENUM(
        'identity',
        'company',
        'financial',
        'legal',
        'technical',
        'application',
        'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    allowedExtensions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      validate: {
        isArray(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('allowedExtensions must be an array');
          }
        }
      }
    },
    maxFileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5242880, // 5MB in bytes
      validate: {
        min: 1024, // 1KB minimum
        max: 104857600 // 100MB maximum
      },
      comment: 'Maximum file size in bytes'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    validityDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when the document type becomes inactive automatically'
    },
    descriptionEn: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'English description of the document type'
    },
    deactivatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when the document type was deactivated'
    },
    deactivationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason why the document type was deactivated'
    }
  }, {
    tableName: 'DocumentTypes',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['code']
      },
      {
        fields: ['category']
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
  DocumentType.associate = function(models) {
    // DocumentType has many Documents
    DocumentType.hasMany(models.Document, {
      foreignKey: 'documentTypeId',
      as: 'documents'
    });
  };

  return DocumentType;
};