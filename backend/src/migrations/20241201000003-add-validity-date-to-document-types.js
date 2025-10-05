'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if validityDate column exists before adding it
    const tableDescription = await queryInterface.describeTable('DocumentTypes');
    
    if (!tableDescription.validityDate) {
      await queryInterface.addColumn('DocumentTypes', 'validityDate', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when the document type becomes inactive automatically'
      });
    }

    // Check if descriptionEn column exists before adding it
    if (!tableDescription.descriptionEn) {
      await queryInterface.addColumn('DocumentTypes', 'descriptionEn', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'English description of the document type'
      });
    }

    // Add index for validityDate for efficient queries (if not exists)
    try {
      await queryInterface.addIndex('DocumentTypes', ['validityDate'], {
        name: 'idx_document_types_validity_date'
      });
    } catch (error) {
      // Index might already exist, ignore error
      console.log('Index idx_document_types_validity_date might already exist');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    try {
      await queryInterface.removeIndex('DocumentTypes', 'idx_document_types_validity_date');
    } catch (error) {
      // Index might not exist, ignore error
    }
    
    // Remove columns
    const tableDescription = await queryInterface.describeTable('DocumentTypes');
    
    if (tableDescription.validityDate) {
      await queryInterface.removeColumn('DocumentTypes', 'validityDate');
    }
    
    if (tableDescription.descriptionEn) {
      await queryInterface.removeColumn('DocumentTypes', 'descriptionEn');
    }
  }
};