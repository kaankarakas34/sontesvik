const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class TicketMessage extends Model {
    static associate(models) {
      TicketMessage.belongsTo(models.Ticket, { foreignKey: 'ticketId', as: 'ticket' });
      TicketMessage.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    }

    markAsRead(readBy) {
      this.isRead = true;
      this.readAt = new Date();
      this.readBy = readBy;
      return this.save();
    }

    editMessage(newContent, editedBy) {
      this.originalContent = this.content;
      this.content = newContent;
      this.editedAt = new Date();
      this.editedBy = editedBy;
      return this.save();
    }

    softDelete(deletedBy) {
      this.isDeleted = true;
      this.deletedAt = new Date();
      this.deletedBy = deletedBy;
      return this.save();
    }

    addAttachment(attachment) {
      if (!this.attachments) {
        this.attachments = [];
      }
      this.attachments.push({
        id: attachment.id,
        name: attachment.name,
        url: attachment.url,
        type: attachment.type,
        size: attachment.size
      });
      return this.save();
    }

    static getUnreadCount(ticketId, userId) {
      return this.count({
        where: {
          ticketId: ticketId,
          isRead: false,
          senderId: { [sequelize.Sequelize.Op.ne]: userId }
        }
      });
    }

    static getMessagesByTicket(ticketId, includeInternal = false) {
      const whereClause = {
        ticketId: ticketId,
        isDeleted: false
      };
      if (!includeInternal) {
        whereClause.isInternal = false;
      }
      return this.findAll({
        where: whereClause,
        order: [['createdAt', 'ASC']]
      });
    }

    static markAllAsRead(ticketId, userId) {
      return this.update(
        {
          isRead: true,
          readAt: new Date(),
          readBy: userId
        },
        {
          where: {
            ticketId: ticketId,
            isRead: false,
            senderId: { [sequelize.Sequelize.Op.ne]: userId }
          }
        }
      );
    }

    static createSystemMessage(ticketId, content, metadata = null, senderId = null) {
      return this.create({
        ticketId: ticketId,
        senderId: senderId,
        content: content,
        messageType: 'system',
        metadata: metadata,
        isInternal: true
      });
    }

    static createStatusChangeMessage(ticketId, oldStatus, newStatus, senderId) {
      const content = `Ticket durumu ${oldStatus} -> ${newStatus} olarak değiştirildi.`;
      return this.create({
        ticketId: ticketId,
        senderId: senderId,
        content: content,
        messageType: 'status_change',
        metadata: { oldStatus, newStatus },
        isInternal: true
      });
    }

    static createAssignmentMessage(ticketId, consultantName, senderId) {
      const content = `Ticket ${consultantName} danışmanına atandı.`;
      return this.create({
        ticketId: ticketId,
        senderId: senderId,
        content: content,
        messageType: 'assignment',
        metadata: { consultantName },
        isInternal: true
      });
    }
  }

  TicketMessage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tickets',
          key: 'id'
        }
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 10000]
        }
      },
      messageType: {
        type: DataTypes.ENUM('message', 'system', 'status_change', 'assignment'),
        defaultValue: 'message',
        allowNull: false
      },
      isInternal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Internal messages are only visible to consultants and admins'
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      readBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of attachment objects with id, name, url, type, size'
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional metadata for system messages'
      },
      editedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      editedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      originalContent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Original content before editing'
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      deletedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'TicketMessage',
      tableName: 'ticket_messages',
      timestamps: true,
      paranoid: true, // Soft delete
      indexes: [
        { fields: ['ticket_id'] },
        { fields: ['sender_id'] },
        { fields: ['created_at'] },
        { fields: ['is_read'] },
        { fields: ['message_type'] },
        { fields: ['is_internal'] },
        { fields: ['is_deleted'] }
      ]
    }
  );

  return TicketMessage;
};