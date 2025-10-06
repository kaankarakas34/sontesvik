'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));

    // Add approved_amount if missing
    if (!table.approved_amount) {
      await queryInterface.addColumn('Applications', 'approved_amount', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Applications').catch(() => ({}));
    if (table && table.approved_amount) {
      await queryInterface.removeColumn('Applications', 'approved_amount');
    }
  }
};


