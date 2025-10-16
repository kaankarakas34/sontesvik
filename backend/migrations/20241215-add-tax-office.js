'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'tax_office', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'company_tax_number'
    });
    
    await queryInterface.addColumn('users', 'billing_address', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'tax_office'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'tax_office');
    await queryInterface.removeColumn('users', 'billing_address');
  }
};