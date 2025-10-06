'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure enum exists
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_Incentives_status" AS ENUM ('active','inactive','expired','planned');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // Add column if missing
    const table = await queryInterface.describeTable('Incentives');
    if (!table.status) {
      await queryInterface.addColumn('Incentives', 'status', {
        type: Sequelize.ENUM('active','inactive','expired','planned'),
        allowNull: false,
        defaultValue: 'planned'
      });
    }

    // Backfill from is_active when present
    await queryInterface.sequelize.query(`
      UPDATE "Incentives"
      SET status = (
        CASE WHEN COALESCE(is_active, true) = true THEN 'active'::"enum_Incentives_status" ELSE 'inactive'::"enum_Incentives_status" END
      )
      WHERE status IS NULL OR status NOT IN ('active','inactive','expired','planned')
    `).catch(() => {});

    // Index
    try {
      await queryInterface.addIndex('Incentives', ['status'], { name: 'incentives_status_idx' });
    } catch (e) {
      if (!String(e?.message||'').includes('already exists')) throw e;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    try { await queryInterface.removeIndex('Incentives', 'incentives_status_idx'); } catch (_) {}

    // Remove column
    const table = await queryInterface.describeTable('Incentives');
    if (table.status) {
      await queryInterface.removeColumn('Incentives', 'status');
    }

    // Drop enum
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Incentives_status";');
  }
};


