'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove FK/index/column from Incentives if present
    const incentives = await queryInterface.describeTable('Incentives').catch(() => ({}));
    if (incentives && incentives.category_id) {
      try { await queryInterface.removeIndex('Incentives', 'incentives_category_id_idx'); } catch (_) {}
      await queryInterface.removeColumn('Incentives', 'category_id');
    }

    // Drop IncentiveCategories table if exists
    try {
      await queryInterface.dropTable('IncentiveCategories');
    } catch (_) {}
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate IncentiveCategories table (minimal) and add category_id back (best-effort)
    try {
      await queryInterface.createTable('IncentiveCategories', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
        name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        slug: { type: Sequelize.STRING(120), allowNull: false, unique: true },
        description: { type: Sequelize.TEXT, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        deleted_at: { type: Sequelize.DATE, allowNull: true }
      });
    } catch (_) {}

    const incentives = await queryInterface.describeTable('Incentives').catch(() => ({}));
    if (incentives && !incentives.category_id) {
      await queryInterface.addColumn('Incentives', 'category_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'IncentiveCategories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      try { await queryInterface.addIndex('Incentives', ['category_id'], { name: 'incentives_category_id_idx' }); } catch (_) {}
    }
  }
};


