const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApplicationMessage = sequelize.define('ApplicationMessage', {
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
        model: 'Applications',
        key: 'id'
      },
      validate: {
        notEmpty: { msg: 'Application ID is required' }
      }
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'id'
      },
      validate: {
        notEmpty: { msg: 'Sender ID is required' }
      }
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'receiver_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Subject is required' },
        len: {
          args: [1, 255],
          msg: 'Subject must be between 1 and 255 characters'
        }
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Message is required' }
      }
    },
    messageType: {
      type: DataTypes.ENUM(
        'question',
        'answer',
        'clarification',
        'document_request',
        'status_update',
        'general'
      ),
      allowNull: false,
      defaultValue: 'general',
      field: 'message_type',
      validate: {
        isIn: {
          args: [[
            'question',
            'answer',
            'clarification',
            'document_request',
            'status_update',
            'general'
          ]],
          msg: 'Invalid message type'
        }
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: {
          args: [['low', 'medium', 'high', 'urgent']],
          msg: 'Priority must be low, medium, high, or urgent'
        }
      }
    },
    status: {
      type: DataTypes.ENUM(
        'open',
        'in_progress',
        'waiting_response',
        'resolved',
        'closed'
      ),
      allowNull: false,
      defaultValue: 'open',
      validate: {
        isIn: {
          args: [[
            'open',
            'in_progress',
            'waiting_response',
            'resolved',
            'closed'
          ]],
          msg: 'Invalid status'
        }
      }
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at'
    },
    parentMessageId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_message_id',
      references: {
        model: 'ApplicationMessages',
        key: 'id'
      }
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidAttachments(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Attachments must be an array');
          }
        }
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      validate: {
        isValidMetadata(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Metadata must be an object');
          }
        }
      }
    }
  }, {
    tableName: 'ApplicationMessages',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['application_id']
      },
      {
        fields: ['sender_id']
      },
      {
        fields: ['receiver_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['is_read']
      },
      {
        fields: ['parent_message_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['message_type']
      },
      {
        fields: ['priority']
      }
    ]
  });

  // Define associations
  ApplicationMessage.associate = function(models) {
    // Belongs to Application
    ApplicationMessage.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });

    // Belongs to User (sender)
    ApplicationMessage.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });

    // Belongs to User (receiver)
    ApplicationMessage.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver'
    });

    // Self-referencing for parent message
    ApplicationMessage.belongsTo(ApplicationMessage, {
      foreignKey: 'parentMessageId',
      as: 'parentMessage'
    });

    // Has many replies
    ApplicationMessage.hasMany(ApplicationMessage, {
      foreignKey: 'parentMessageId',
      as: 'replies'
    });
  };

  // Instance methods
  ApplicationMessage.prototype.markAsRead = async function(userId) {
    if (this.receiverId === userId || this.senderId === userId) {
      this.isRead = true;
      this.readAt = new Date();
      return this.save();
    }
    throw new Error('Unauthorized to mark message as read');
  };

  ApplicationMessage.prototype.reply = async function(replyData) {
    return ApplicationMessage.create({
      ...replyData,
      applicationId: this.applicationId,
      parentMessageId: this.id,
      messageType: 'answer'
    });
  };

  ApplicationMessage.prototype.updateStatus = async function(newStatus) {
    this.status = newStatus;
    return this.save();
  };

  // Class methods
  ApplicationMessage.findByApplicationId = function(applicationId, options = {}) {
    return this.findAll({
      where: { applicationId },
      include: [
        {
          association: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          association: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          association: 'replies',
          include: [
            {
              association: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'email', 'role']
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC'], ['replies', 'createdAt', 'ASC']],
      ...options
    });
  };

  ApplicationMessage.findUnreadMessages = function(userId, options = {}) {
    return this.findAll({
      where: {
        receiverId: userId,
        isRead: false
      },
      include: [
        {
          association: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          association: 'application',
          attributes: ['id', 'applicationNumber', 'projectTitle']
        }
      ],
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  ApplicationMessage.getMessageThread = function(messageId, options = {}) {
    return this.findOne({
      where: { id: messageId },
      include: [
        {
          association: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          association: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        },
        {
          association: 'replies',
          include: [
            {
              association: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'email', 'role']
            },
            {
              association: 'receiver',
              attributes: ['id', 'firstName', 'lastName', 'email', 'role']
            }
          ]
        },
        {
          association: 'parentMessage',
          include: [
            {
              association: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'email', 'role']
            }
          ]
        }
      ],
      ...options
    });
  };

  return ApplicationMessage;
};