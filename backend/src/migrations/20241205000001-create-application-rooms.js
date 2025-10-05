'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ApplicationRooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      application_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      room_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      room_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          'active',
          'waiting_documents',
          'under_review',
          'completed',
          'archived'
        ),
        allowNull: false,
        defaultValue: 'active'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      last_activity_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      consultant_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          allowFileUpload: true,
          maxFileSize: 10485760,
          allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
          notificationsEnabled: true,
          autoArchiveAfterDays: 90
        }
      },
      stats: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {
          totalMessages: 0,
          totalDocuments: 0,
          lastConsultantActivity: null,
          lastUserActivity: null,
          responseTime: null
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Indexes
    await queryInterface.addIndex('ApplicationRooms', ['application_id'], {
      name: 'application_rooms_application_id_idx'
    });

    await queryInterface.addIndex('ApplicationRooms', ['status'], {
      name: 'application_rooms_status_idx'
    });

    await queryInterface.addIndex('ApplicationRooms', ['priority'], {
      name: 'application_rooms_priority_idx'
    });

    await queryInterface.addIndex('ApplicationRooms', ['last_activity_at'], {
      name: 'application_rooms_last_activity_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ApplicationRooms');
  }
};