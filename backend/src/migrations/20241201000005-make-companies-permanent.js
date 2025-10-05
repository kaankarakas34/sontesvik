'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make all existing companies permanent by setting isApproved to true
    // and ensuring they cannot be soft deleted
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET is_approved = true, status = 'active', deleted_at = NULL
      WHERE role = 'company' AND deleted_at IS NOT NULL
    `);

    // Ensure all existing companies are approved
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET is_approved = true
      WHERE role = 'company' AND is_approved = false
    `);

    // Add a comment to document this change
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE users IS 'Users table - Companies (role=company) are permanent entities and cannot be deleted'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert changes if needed (this is optional)
    // Note: We don't make companies deletable again as this would defeat the purpose
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE users IS 'Users table'
    `);
  }
};