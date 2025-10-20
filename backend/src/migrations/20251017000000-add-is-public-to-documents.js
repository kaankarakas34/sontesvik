'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('Documents');
      
      if (!tableDescription.is_public) {
        // Add is_public column
        await queryInterface.addColumn('Documents', 'is_public', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }, { transaction });
        
        console.log('✅ is_public column added to Documents table');
      } else {
        console.log('ℹ️ is_public column already exists');
      }
      
      await transaction.commit();
      
      console.log('✅ Document is_public migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error in document is_public migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if column exists before removing
      const tableDescription = await queryInterface.describeTable('Documents');
      
      if (tableDescription.is_public) {
        await queryInterface.removeColumn('Documents', 'is_public', { transaction });
        console.log('✅ is_public column removed from Documents table');
      } else {
        console.log('ℹ️ is_public column does not exist');
      }
      
      await transaction.commit();
      
      console.log('✅ Document is_public rollback completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error in document is_public rollback:', error);
      throw error;
    }
  }
};