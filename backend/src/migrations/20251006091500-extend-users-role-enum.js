'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Extend enum to include 'member' (idempotent)
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_users_role' AND e.enumlabel = 'member'
        ) THEN
          ALTER TYPE "enum_users_role" ADD VALUE 'member';
        END IF;
      END
      $$;
    `);

    // Optional: ensure index exists
    try {
      await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
    } catch (err) {
      if (!String(err?.message || '').includes('already exists')) throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // PostgreSQL cannot drop a single enum value easily; no-op for down.
    // If needed, a full type recreate would be required.
    return Promise.resolve();
  }
};


