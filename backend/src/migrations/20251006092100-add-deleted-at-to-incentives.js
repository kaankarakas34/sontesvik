'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Incentives').catch(() => ({}));
    if (!table || !table.deleted_at) {
      await queryInterface.addColumn('Incentives', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Incentives').catch(() => ({}));
    if (table && table.deleted_at) {
      await queryInterface.removeColumn('Incentives', 'deleted_at');
    }
  }
};


