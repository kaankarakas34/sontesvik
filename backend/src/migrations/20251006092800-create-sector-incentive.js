'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create join table if missing
    try {
      await queryInterface.describeTable('SectorIncentive');
      // table exists → skip create
    } catch (_) {
      await queryInterface.createTable('SectorIncentive', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        sector_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Sectors', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        incentive_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'Incentives', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      // Unique pair and helpful indexes (idempotent)
      try { await queryInterface.addIndex('SectorIncentive', ['sector_id'], { name: 'sector_incentive_sector_idx' }); } catch (e) {}
      try { await queryInterface.addIndex('SectorIncentive', ['incentive_id'], { name: 'sector_incentive_incentive_idx' }); } catch (e) {}
      try { await queryInterface.addConstraint('SectorIncentive', {
        fields: ['sector_id', 'incentive_id'],
        type: 'unique',
        name: 'sector_incentive_unique_pair'
      }); } catch (e) {}
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop table safely
    try {
      await queryInterface.dropTable('SectorIncentive');
    } catch (_) {}
  }
};


