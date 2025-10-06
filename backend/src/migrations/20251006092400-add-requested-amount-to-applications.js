'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));

    // Add requested_amount if missing
    if (!table.requested_amount) {
      await queryInterface.addColumn('Applications', 'requested_amount', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));
    if (table && table.requested_amount) {
      await queryInterface.removeColumn('Applications', 'requested_amount');
    }
  }
};


