'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // If correct table exists, ensure indexes and exit
    try {
      await queryInterface.describeTable('incentive_guides');
    } catch (_) {
      // If camel case table exists, rename it; otherwise create fresh
      try {
        await queryInterface.describeTable('IncentiveGuides');
        await queryInterface.renameTable('IncentiveGuides', 'incentive_guides');
      } catch (e) {
        // Create fresh table
        await queryInterface.createTable('incentive_guides', {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
          incentive_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'Incentives', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          title: { type: Sequelize.STRING(255), allowNull: false },
          content: { type: Sequelize.TEXT, allowNull: false },
          regulations: { type: Sequelize.TEXT, allowNull: true },
          requiredDocuments: { type: Sequelize.JSONB, allowNull: true, defaultValue: '[]' },
          applicationSteps: { type: Sequelize.JSONB, allowNull: true, defaultValue: '[]' },
          eligibilityCriteria: { type: Sequelize.JSONB, allowNull: true, defaultValue: '{}' },
          deadlines: { type: Sequelize.JSONB, allowNull: true, defaultValue: '{}' },
          contactInfo: { type: Sequelize.JSONB, allowNull: true, defaultValue: '{}' },
          faqs: { type: Sequelize.JSONB, allowNull: true, defaultValue: '[]' },
          is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
          published_at: { type: Sequelize.DATE, allowNull: true },
          created_by: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
          updated_by: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
          created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          deleted_at: { type: Sequelize.DATE, allowNull: true }
        });
      }
    }

    // Ensure indexes exist
    try { await queryInterface.addIndex('incentive_guides', ['incentive_id'], { name: 'incentive_guides_incentive_id_idx' }); } catch (_) {}
    try { await queryInterface.addIndex('incentive_guides', ['is_active'], { name: 'incentive_guides_is_active_idx' }); } catch (_) {}
    try { await queryInterface.addIndex('incentive_guides', ['published_at'], { name: 'incentive_guides_published_at_idx' }); } catch (_) {}
  },

  down: async (queryInterface, Sequelize) => {
    // Best-effort revert: drop indexes and table
    try { await queryInterface.removeIndex('incentive_guides', 'incentive_guides_incentive_id_idx'); } catch (_) {}
    try { await queryInterface.removeIndex('incentive_guides', 'incentive_guides_is_active_idx'); } catch (_) {}
    try { await queryInterface.removeIndex('incentive_guides', 'incentive_guides_published_at_idx'); } catch (_) {}
    try { await queryInterface.dropTable('incentive_guides'); } catch (_) {}
  }
};


