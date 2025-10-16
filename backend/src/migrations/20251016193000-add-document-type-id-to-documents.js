'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('Documents');
      
      if (!tableDescription.document_type_id) {
        // Add document_type_id column
        await queryInterface.addColumn('Documents', 'document_type_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'DocumentTypes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
        
        console.log('✅ document_type_id column added to Documents table');
      } else {
        console.log('ℹ️ document_type_id column already exists');
      }
      
      // Add index for document_type_id
      await queryInterface.addIndex('Documents', ['document_type_id'], {
        name: 'documents_document_type_id_idx',
        transaction
      });
      
      await transaction.commit();
      
      console.log('✅ Document type ID migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error in document type ID migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove index first
      await queryInterface.removeIndex('Documents', 'documents_document_type_id_idx', { transaction });
      
      // Remove column
      await queryInterface.removeColumn('Documents', 'document_type_id', { transaction });
      
      await transaction.commit();
      
      console.log('✅ Document type ID migration rolled back successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error rolling back document type ID migration:', error);
      throw error;
    }
  }
};