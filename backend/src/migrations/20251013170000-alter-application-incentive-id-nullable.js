'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Applications', 'incentive_id', {
      type: Sequelize.UUID,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Applications', 'incentive_id', {
      type: Sequelize.UUID,
      allowNull: false
    });
  }
};