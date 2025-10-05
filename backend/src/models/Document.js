const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name', // Map to database column
      validate: {
        notEmpty: { msg: 'File name is required' }
      }
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'original_name', // Map to database column
      validate: {
        notEmpty: { msg: 'Original file name is required' }
      }
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_path', // Map to database column
      validate: {
        notEmpty: { msg: 'File path is required' }
      }
    },
    fileSize: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'file_size', // Map to database column
      validate: {
        min: {
          args: [0],
          msg: 'File size cannot be negative'
        }
      }
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type', // Map to database column
      validate: {
        notEmpty: { msg: 'MIME type is required' }
      }
    },
    documentType: {
      type: DataTypes.ENUM(
        'identity',
        'tax_certificate',
        'trade_registry',
        'financial_statement',
        'project_proposal',
        'business_plan',
        'contract',
        'invoice',
        'receipt',
        'certificate',
        'permit',
        'license',
        'other'
      ),
      allowNull: false,
      defaultValue: 'other',
      field: 'document_type', // Map to database column
      validate: {
        isIn: {
          args: [[
            'identity',
            'tax_certificate',
            'trade_registry',
            'financial_statement',
            'project_proposal',
            'business_plan',
            'contract',
            'invoice',
            'receipt',
            'certificate',
            'permit',
            'license',
            'other'
          ]],
          msg: 'Invalid document type'
        }
      }
    },
    documentTypeId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'document_type_id', // Map to database column
      references: {
        model: 'DocumentTypes',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired', 'archived'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'approved', 'rejected', 'expired', 'archived']],
          msg: 'Status must be pending, approved, rejected, expired, or archived'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_required' // Map to database column
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_public' // Map to database column
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expiry_date' // Map to database column
    },
    uploadedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'uploaded_at' // Map to database column
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verified_at' // Map to database column
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'download_count' // Map to database column
    },
    checksum: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'SHA-256 checksum for file integrity'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional metadata like image dimensions, document pages, etc.'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id', // Map to database column
      references: {
        model: 'users',
        key: 'id'
      }
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'application_id', // Map to database column
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'verified_by', // Map to database column
      references: {
        model: 'users',
        key: 'id'
      }
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'archived_at', // Map to database column
      comment: 'Date when the document was archived'
    },
    archivedReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'archived_reason', // Map to database column
      comment: 'Reason why the document was archived'
    }
  }, {
    tableName: 'Documents', // Use correct table name with capital D
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['file_name']
      },
      {
        fields: ['document_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['application_id']
      },
      {
        fields: ['uploaded_at']
      },
      {
        fields: ['status', 'user_id']
      }
    ]
  });

  // Instance methods
  Document.prototype.isExpired = function() {
    return this.expiryDate && new Date() > this.expiryDate;
  };

  Document.prototype.isImage = function() {
    return this.mimeType.startsWith('image/');
  };

  Document.prototype.isPDF = function() {
    return this.mimeType === 'application/pdf';
  };

  Document.prototype.isOfficeDocument = function() {
    const officeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    return officeTypes.includes(this.mimeType);
  };

  Document.prototype.getFileExtension = function() {
    return this.originalName.split('.').pop().toLowerCase();
  };

  Document.prototype.getFileSizeFormatted = function() {
    const bytes = parseInt(this.fileSize);
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  Document.prototype.incrementDownloadCount = async function() {
    return this.increment('downloadCount');
  };

  Document.prototype.markAsVerified = async function(verifiedBy) {
    return this.update({
      status: 'approved',
      verifiedAt: new Date(),
      verifiedBy: verifiedBy
    });
  };

  Document.prototype.reject = async function() {
    return this.update({
      status: 'rejected'
    });
  };

  // Class methods
  Document.findByType = function(documentType) {
    return this.findAll({
      where: { documentType },
      order: [['uploadedAt', 'DESC']]
    });
  };

  Document.findByUser = function(userId) {
    return this.findAll({
      where: { userId },
      order: [['uploadedAt', 'DESC']]
    });
  };

  Document.findByApplication = function(applicationId) {
    return this.findAll({
      where: { applicationId },
      order: [['uploadedAt', 'DESC']]
    });
  };

  Document.findPendingVerification = function() {
    return this.findAll({
      where: { status: 'pending' },
      order: [['uploadedAt', 'ASC']]
    });
  };

  Document.findExpired = function() {
    return this.findAll({
      where: {
        expiryDate: {
          [sequelize.Sequelize.Op.lt]: new Date()
        },
        status: {
          [sequelize.Sequelize.Op.ne]: 'expired'
        }
      }
    });
  };

  // Define associations
  Document.associate = function(models) {
    // Document belongs to User (uploader)
    Document.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Document belongs to Application
    Document.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });

    // Document belongs to DocumentType
    Document.belongsTo(models.DocumentType, {
      foreignKey: 'documentTypeId',
      as: 'documentTypeInfo'
    });

    // Document belongs to User (verifier)
    Document.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });
  };

  return Document;
};