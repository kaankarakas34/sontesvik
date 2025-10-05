'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing columns to notifications table
    await queryInterface.addColumn('notifications', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('notifications', 'is_read', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('notifications', 'read_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('notifications', 'type', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'general'
    });

    await queryInterface.addColumn('notifications', 'message', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('notifications', 'data', {
      type: Sequelize.JSON,
      allowNull: true
    });

    // Add indexes for better performance
    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['is_read']);
    await queryInterface.addIndex('notifications', ['type']);
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('notifications', ['user_id']);
    await queryInterface.removeIndex('notifications', ['is_read']);
    await queryInterface.removeIndex('notifications', ['type']);

    // Remove columns
    await queryInterface.removeColumn('notifications', 'user_id');
    await queryInterface.removeColumn('notifications', 'is_read');
    await queryInterface.removeColumn('notifications', 'read_at');
    await queryInterface.removeColumn('notifications', 'type');
    await queryInterface.removeColumn('notifications', 'message');
    await queryInterface.removeColumn('notifications', 'data');
  }
};
