'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if archivedAt column exists
      const tableDescription = await queryInterface.describeTable('Documents');
      
      if (!tableDescription.archivedAt) {
        await queryInterface.addColumn('Documents', 'archivedAt', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Date when the document was archived'
        }, { transaction });
      }

      if (!tableDescription.archivedReason) {
        await queryInterface.addColumn('Documents', 'archivedReason', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Reason why the document was archived'
        }, { transaction });
      }

      // Add status column if it doesn't exist
      if (!tableDescription.status) {
        await queryInterface.addColumn('Documents', 'status', {
          type: Sequelize.ENUM('active', 'inactive', 'archived'),
          allowNull: false,
          defaultValue: 'active',
          comment: 'Status of the document'
        }, { transaction });
      } else {
        // If status column exists, try to add 'archived' to existing enum
        try {
          await queryInterface.sequelize.query(`
            DO $$ 
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'archived' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_Documents_status')) THEN
                ALTER TYPE "enum_Documents_status" ADD VALUE 'archived';
              END IF;
            END $$;
          `, { transaction });
        } catch (error) {
          console.log('Could not add archived value to enum:', error.message);
        }
      }

      // Add indexes for the new fields
      try {
        await queryInterface.addIndex('Documents', ['archivedAt'], {
          name: 'documents_archived_at_idx',
          transaction
        });
      } catch (error) {
        // Index might already exist, ignore error
        console.log('Index documents_archived_at_idx might already exist:', error.message);
      }

      try {
        await queryInterface.addIndex('Documents', ['status'], {
          name: 'documents_status_idx',
          transaction
        });
      } catch (error) {
        // Index might already exist, ignore error
        console.log('Index documents_status_idx might already exist:', error.message);
      }

      await transaction.commit();
      console.log('Successfully added archive fields to documents table');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error adding archive fields to documents table:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove indexes
      try {
        await queryInterface.removeIndex('Documents', 'documents_status_idx', { transaction });
      } catch (error) {
        // Index might not exist, ignore error
        console.log('Index documents_status_idx might not exist:', error.message);
      }

      try {
        await queryInterface.removeIndex('Documents', 'documents_archived_at_idx', { transaction });
      } catch (error) {
        // Index might not exist, ignore error
        console.log('Index documents_archived_at_idx might not exist:', error.message);
      }

      // Remove columns
      const tableDescription = await queryInterface.describeTable('Documents');
      
      if (tableDescription.archivedReason) {
        await queryInterface.removeColumn('Documents', 'archivedReason', { transaction });
      }

      if (tableDescription.archivedAt) {
        await queryInterface.removeColumn('Documents', 'archivedAt', { transaction });
      }

      await transaction.commit();
      console.log('Successfully removed archive fields from documents table');
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error removing archive fields from documents table:', error);
      throw error;
    }
  }
};