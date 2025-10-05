'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.ENUM('technical', 'consultant')
      },
      status: {
        type: Sequelize.ENUM('open', 'in-progress', 'closed')
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high')
      },
      userId: {
        type: Sequelize.INTEGER
      },
      consultantId: {
        type: Sequelize.INTEGER
      },
      sectorId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tickets');
  }
};