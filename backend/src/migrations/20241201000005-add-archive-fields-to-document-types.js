'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if deactivatedAt column exists
      const tableDescription = await queryInterface.describeTable('DocumentTypes');
      
      if (!tableDescription.deactivatedAt) {
        await queryInterface.addColumn('DocumentTypes', 'deactivatedAt', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when the document type was deactivated'
        }, { transaction });
      }

      if (!tableDescription.deactivationReason) {
        await queryInterface.addColumn('DocumentTypes', 'deactivationReason', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason why the document type was deactivated'
        }, { transaction });
      }

      // Add indexes for the new fields
      try {
        await queryInterface.addIndex('DocumentTypes', ['deactivatedAt'], {
          name: 'document_types_deactivated_at_idx',
          transaction
        });
      } catch (error) {
        // Index might already exist, ignore error
        console.log('Index document_types_deactivated_at_idx might already exist:', error.message);
      }

      try {
        await queryInterface.addIndex('DocumentTypes', ['validityDate'], {
          name: 'document_types_validity_date_idx',
          transaction
        });
      } catch (error) {
        // Index might already exist, ignore error
        console.log('Index document_types_validity_date_idx might already exist:', error.message);
      }

      await transaction.commit();
      console.log('Successfully added archive fields to DocumentTypes table');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error adding archive fields to DocumentTypes table:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove indexes
      try {
        await queryInterface.removeIndex('DocumentTypes', 'document_types_validity_date_idx', { transaction });
      } catch (error) {
        // Index might not exist, ignore error
        console.log('Index document_types_validity_date_idx might not exist:', error.message);
      }

      try {
        await queryInterface.removeIndex('DocumentTypes', 'document_types_deactivated_at_idx', { transaction });
      } catch (error) {
        // Index might not exist, ignore error
        console.log('Index document_types_deactivated_at_idx might not exist:', error.message);
      }

      // Remove columns
      const tableDescription = await queryInterface.describeTable('DocumentTypes');
      
      if (tableDescription.deactivationReason) {
        await queryInterface.removeColumn('DocumentTypes', 'deactivationReason', { transaction });
      }

      if (tableDescription.deactivatedAt) {
        await queryInterface.removeColumn('DocumentTypes', 'deactivatedAt', { transaction });
      }

      await transaction.commit();
      console.log('Successfully removed archive fields from DocumentTypes table');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error removing archive fields from DocumentTypes table:', error);
      throw error;
    }
  }
};