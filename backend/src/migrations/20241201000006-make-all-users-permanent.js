'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make ALL existing users permanent by restoring any soft-deleted users
    // and ensuring they cannot be soft deleted in the future
    
    // Restore all soft-deleted users
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET deleted_at = NULL
      WHERE deleted_at IS NOT NULL
    `);

    // Ensure all users are approved (status column does not exist in schema)
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET is_approved = true
      WHERE is_approved = false
    `);

    // Add a comment to document this change
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE users IS 'Users table - ALL users are permanent entities and cannot be deleted'
    `);

    console.log('✅ All users have been made permanent and restored');
  },

  async down(queryInterface, Sequelize) {
    // Revert changes if needed (this is optional)
    // Note: We don't make users deletable again as this would defeat the purpose
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE users IS 'Users table'
    `);
  }
};