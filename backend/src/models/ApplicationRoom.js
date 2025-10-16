const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApplicationRoom = sequelize.define('ApplicationRoom', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Her başvuru için tek room
      field: 'application_id',
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    roomName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'room_name'
    },
    roomDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'room_description'
    },
    status: {
      type: DataTypes.ENUM(
        'active',
        'waiting_documents',
        'under_review',
        'additional_info_required',
        'approved',
        'rejected',
        'completed',
        'archived'
      ),
      allowNull: false,
      defaultValue: 'active'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    // Room içindeki son aktivite
    lastActivityAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_activity_at'
    },
    // Danışman notları
    consultantNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'consultant_notes'
    },
    // Room ayarları
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        allowFileUpload: true,
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        notificationsEnabled: true,
        autoArchiveAfterDays: 90
      }
    },
    // Room istatistikleri
    stats: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        totalMessages: 0,
        totalDocuments: 0,
        lastConsultantActivity: null,
        lastUserActivity: null,
        responseTime: null
      }
    }
  }, {
    tableName: 'ApplicationRooms',
    timestamps: true,
    paranoid: true, // Soft delete
    underscored: true,
    indexes: [
      {
        fields: ['application_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['last_activity_at']
      }
    ]
  });

  // Associations
  ApplicationRoom.associate = function(models) {
    // Room belongs to Application (1:1)
    ApplicationRoom.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });

    // Room has many messages through Application
    ApplicationRoom.hasMany(models.ApplicationMessage, {
      foreignKey: 'applicationId',
      sourceKey: 'applicationId',
      as: 'messages'
    });

    // Room has many documents through Application
    ApplicationRoom.hasMany(models.Document, {
      foreignKey: 'applicationId',
      sourceKey: 'applicationId',
      as: 'documents'
    });
  };

  // Instance Methods
  ApplicationRoom.prototype.updateActivity = async function() {
    this.lastActivityAt = new Date();
    return this.save();
  };

  ApplicationRoom.prototype.addConsultantNote = async function(note, consultantId) {
    const timestamp = new Date().toISOString();
    const noteEntry = `[${timestamp}] ${note}`;
    
    if (this.consultantNotes) {
      this.consultantNotes += '\n\n' + noteEntry;
    } else {
      this.consultantNotes = noteEntry;
    }
    
    await this.updateActivity();
    return this.save();
  };

  ApplicationRoom.prototype.updateStats = async function(type, data = {}) {
    const stats = this.stats || {};
    
    switch (type) {
      case 'message':
        stats.totalMessages = (stats.totalMessages || 0) + 1;
        if (data.isConsultant) {
          stats.lastConsultantActivity = new Date();
        } else {
          stats.lastUserActivity = new Date();
        }
        break;
      case 'document':
        stats.totalDocuments = (stats.totalDocuments || 0) + 1;
        break;
      case 'response_time':
        stats.responseTime = data.responseTime;
        break;
    }
    
    this.stats = stats;
    await this.updateActivity();
    return this.save();
  };

  ApplicationRoom.prototype.setPriority = async function(priority, reason = null) {
    this.priority = priority;
    
    if (reason) {
      await this.addConsultantNote(`Öncelik ${priority} olarak değiştirildi. Sebep: ${reason}`);
    }
    
    return this.save();
  };

  // Class Methods
  ApplicationRoom.createForApplication = async function(applicationId, options = {}) {
    const { Application, User, Incentive } = require('./index');
    
    // Application bilgilerini al
    const application = await Application.findByPk(applicationId, {
      include: [
        { model: User, as: 'user' },
        { model: Incentive, as: 'incentive' }
      ]
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const roomName = `${application.applicationNumber} - ${application.user.firstName} ${application.user.lastName}`;
    const roomDescription = `${application.incentive.title} teşvik başvurusu için oluşturulan room`;

    return this.create({
      applicationId,
      roomName,
      roomDescription,
      priority: application.priority || 'medium',
      ...options
    });
  };

  ApplicationRoom.findActiveRooms = function(consultantId = null, options = {}) {
    const { Application, User } = require('./index');
    
    const whereClause = {
      status: ['active', 'waiting_documents', 'under_review']
    };

    const include = [
      {
        model: Application,
        as: 'application',
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'assignedConsultant', attributes: ['id', 'firstName', 'lastName'] }
        ]
      }
    ];

    // Eğer consultantId verilmişse, sadece o danışmanın roomlarını getir
    if (consultantId) {
      include[0].where = { assignedConsultantId: consultantId };
    }

    return this.findAll({
      where: whereClause,
      include,
      order: [['priority', 'DESC'], ['lastActivityAt', 'DESC']],
      ...options
    });
  };

  ApplicationRoom.findByApplicationId = function(applicationId) {
    const { Application, User, Incentive } = require('./index');
    
    return this.findOne({
      where: { applicationId },
      include: [
        {
          model: Application,
          as: 'application',
          include: [
            { model: User, as: 'user' },
            { model: User, as: 'assignedConsultant' },
            { model: Incentive, as: 'incentive' }
          ]
        }
      ]
    });
  };

  return ApplicationRoom;
};