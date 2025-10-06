'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make migration idempotent: only add column if it doesn't exist
    const table = await queryInterface.describeTable('users');
    if (!table.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('admin', 'company', 'consultant'),
        allowNull: false,
        defaultValue: 'company'
      });
    }

    // Add index for role column (skip if exists)
    try {
      await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
    } catch (err) {
      if (!String(err?.message || '').includes('already exists')) throw err;
    }

    // Optional backfill for admin users
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email LIKE '%admin%' OR email = 'admin@tesvik360.com'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first (ignore if missing)
    try {
      await queryInterface.removeIndex('users', 'users_role_idx');
    } catch (err) {
      // ignore
    }
    
    // Remove role column if exists
    const table = await queryInterface.describeTable('users');
    if (table.role) {
      await queryInterface.removeColumn('users', 'role');
    }
  }
};