'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add role column to users table
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'company', 'consultant'),
      allowNull: false,
      defaultValue: 'company'
    });

    // Add index for role column
    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });

    // Update existing users based on their current status
    // Set admin role for admin users (you might need to adjust this logic)
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email LIKE '%admin%' OR email = 'admin@tesvik360.com'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index first
    await queryInterface.removeIndex('users', 'users_role_idx');
    
    // Remove role column
    await queryInterface.removeColumn('users', 'role');
  }
};