'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('Documents');
      
      if (!tableDescription.expiry_date) {
        // Add expiry_date column
        await queryInterface.addColumn('Documents', 'expiry_date', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
        
        console.log('✅ expiry_date column added to Documents table');
      } else {
        console.log('ℹ️ expiry_date column already exists');
      }
      
      await transaction.commit();
      
      console.log('✅ Document expiry_date migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error in document expiry_date migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if column exists before removing
      const tableDescription = await queryInterface.describeTable('Documents');
      
      if (tableDescription.expiry_date) {
        await queryInterface.removeColumn('Documents', 'expiry_date', { transaction });
        console.log('✅ expiry_date column removed from Documents table');
      } else {
        console.log('ℹ️ expiry_date column does not exist');
      }
      
      await transaction.commit();
      
      console.log('✅ Document expiry_date migration rolled back successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error rolling back document expiry_date migration:', error);
      throw error;
    }
  }
};