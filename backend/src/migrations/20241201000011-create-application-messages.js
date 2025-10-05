'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create ApplicationMessages table for ticket system
    await queryInterface.createTable('ApplicationMessages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'application_id',
        references: {
          model: 'Applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'sender_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      receiverId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'receiver_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      messageType: {
        type: Sequelize.ENUM(
          'question',
          'answer',
          'clarification',
          'document_request',
          'status_update',
          'general'
        ),
        allowNull: false,
        defaultValue: 'general',
        field: 'message_type'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      status: {
        type: Sequelize.ENUM(
          'open',
          'in_progress',
          'waiting_response',
          'resolved',
          'closed'
        ),
        allowNull: false,
        defaultValue: 'open'
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read'
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'read_at'
      },
      parentMessageId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'parent_message_id',
        references: {
          model: 'ApplicationMessages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '[]',
        comment: 'Array of attachment file information'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '{}',
        comment: 'Additional message metadata'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'updated_at'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at'
      }
    });

    // Add indexes
    await queryInterface.addIndex('ApplicationMessages', ['application_id'], {
      name: 'application_messages_application_id_idx'
    });
    
    await queryInterface.addIndex('ApplicationMessages', ['sender_id'], {
      name: 'application_messages_sender_id_idx'
    });
    
    await queryInterface.addIndex('ApplicationMessages', ['receiver_id'], {
      name: 'application_messages_receiver_id_idx'
    });
    
    await queryInterface.addIndex('ApplicationMessages', ['status'], {
      name: 'application_messages_status_idx'
    });
    
    await queryInterface.addIndex('ApplicationMessages', ['is_read'], {
      name: 'application_messages_is_read_idx'
    });
    
    await queryInterface.addIndex('ApplicationMessages', ['parent_message_id'], {
      name: 'application_messages_parent_message_id_idx'
    });
    
    await queryInterface.addIndex('ApplicationMessages', ['created_at'], {
      name: 'application_messages_created_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ApplicationMessages');
  }
};