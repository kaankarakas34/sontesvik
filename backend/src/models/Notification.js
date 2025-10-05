const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    targetConsultants: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'target_consultants'
    },
    targetUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'target_users'
    },
    targetSectors: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'target_sectors',
      comment: 'Array of sector IDs that this notification targets'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Specific user this notification is for (if null, it is a general notification)'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
      comment: 'Whether the notification has been read by the user'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
      comment: 'When the notification was read'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'general',
      validate: {
        isIn: [['general', 'room_message', 'room_document', 'room_status_change', 'room_priority_change', 'consultant_note']]
      },
      comment: 'Type of notification for categorization'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional message content for specific notification types'
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional data for the notification (room ID, application ID, etc.)'
    }
  }, {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['created_at']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['target_consultants']
      },
      {
        fields: ['target_users']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['is_read']
      },
      {
        fields: ['type']
      }
    ]
  });

  return Notification;
};