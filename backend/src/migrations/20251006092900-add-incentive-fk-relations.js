'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Incentives').catch(() => ({}));

    if (!table.incentive_type_id) {
      await queryInterface.addColumn('Incentives', 'incentive_type_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'IncentiveTypes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      try { await queryInterface.addIndex('Incentives', ['incentive_type_id'], { name: 'incentives_incentive_type_id_idx' }); } catch (_) {}
    }

    if (!table.category_id) {
      await queryInterface.addColumn('Incentives', 'category_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'IncentiveCategories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      try { await queryInterface.addIndex('Incentives', ['category_id'], { name: 'incentives_category_id_idx' }); } catch (_) {}
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Incentives').catch(() => ({}));
    if (table && table.category_id) {
      try { await queryInterface.removeIndex('Incentives', 'incentives_category_id_idx'); } catch (_) {}
      await queryInterface.removeColumn('Incentives', 'category_id');
    }
    if (table && table.incentive_type_id) {
      try { await queryInterface.removeIndex('Incentives', 'incentives_incentive_type_id_idx'); } catch (_) {}
      await queryInterface.removeColumn('Incentives', 'incentive_type_id');
    }
  }
};


