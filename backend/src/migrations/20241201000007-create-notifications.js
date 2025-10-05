'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true
      },
      target_consultants: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      target_users: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      target_sectors: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      }
    });

    // Add indexes with IF NOT EXISTS check
    try {
      await queryInterface.addIndex('notifications', ['created_at'], { name: 'notifications_created_at' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('notifications', ['is_active'], { name: 'notifications_is_active' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('notifications', ['target_consultants'], { name: 'notifications_target_consultants' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('notifications', ['target_users'], { name: 'notifications_target_users' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('notifications', ['created_by'], { name: 'notifications_created_by' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  }
};