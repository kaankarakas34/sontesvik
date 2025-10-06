'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));
    if (!table || !table.deleted_at) {
      await queryInterface.addColumn('Applications', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));
    if (table && table.deleted_at) {
      await queryInterface.removeColumn('Applications', 'deleted_at');
    }
  }
};


