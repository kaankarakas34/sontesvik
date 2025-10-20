'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'pending' to the enum_Applications_status enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Applications_status" ADD VALUE 'pending';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type and updating all references
    console.log('Removing enum values is not supported in PostgreSQL. Manual intervention required.');
  }
};