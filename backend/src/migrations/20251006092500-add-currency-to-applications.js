'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));

    if (!table.currency) {
      await queryInterface.addColumn('Applications', 'currency', {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'TRY'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));
    if (table && table.currency) {
      await queryInterface.removeColumn('Applications', 'currency');
    }
  }
};


