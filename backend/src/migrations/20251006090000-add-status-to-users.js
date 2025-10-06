'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Ensure enum type exists
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_users_status" AS ENUM ('active', 'pending', 'suspended', 'inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Add status column if missing
    const table = await queryInterface.describeTable('users');
    if (!table.status) {
      await queryInterface.addColumn('users', 'status', {
        type: Sequelize.ENUM('active', 'pending', 'suspended', 'inactive'),
        allowNull: false,
        defaultValue: 'pending'
      });
    }

    // Backfill reasonable defaults using existing flags (if columns exist)
    await queryInterface.sequelize.query(`
      UPDATE users
      SET status = (
        CASE
          WHEN COALESCE(is_active, true) = false THEN 'inactive'::"enum_users_status"
          WHEN COALESCE(is_approved, false) = true THEN 'active'::"enum_users_status"
          ELSE 'pending'::"enum_users_status"
        END
      )
      WHERE status IS NULL OR status NOT IN ('active','pending','suspended','inactive')
    `);

    // Index for status (optional, safe)
    try {
      await queryInterface.addIndex('users', ['status'], { name: 'users_status_idx' });
    } catch (err) {
      if (!String(err?.message || '').includes('already exists')) throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index if exists
    try {
      await queryInterface.removeIndex('users', 'users_status_idx');
    } catch (err) {
      // ignore
    }

    // Remove column if exists
    const table = await queryInterface.describeTable('users');
    if (table.status) {
      await queryInterface.removeColumn('users', 'status');
    }

    // Drop enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_status";');
  }
};


