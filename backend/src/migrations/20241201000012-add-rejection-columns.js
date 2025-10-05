'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add rejection-related columns to users table
    const columnsToAdd = [
      {
        name: 'rejected_by',
        definition: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        }
      },
      {
        name: 'rejected_at',
        definition: {
          type: Sequelize.DATE,
          allowNull: true
        }
      },
      {
        name: 'rejection_reason',
        definition: {
          type: Sequelize.TEXT,
          allowNull: true
        }
      }
    ];

    // Add each column
    for (const column of columnsToAdd) {
      try {
        await queryInterface.addColumn('users', column.name, column.definition);
        console.log(`Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`Column ${column.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Add indexes
    const indexesToAdd = [
      { fields: ['rejected_by'], name: 'users_rejected_by_idx' },
      { fields: ['rejected_at'], name: 'users_rejected_at_idx' }
    ];

    for (const index of indexesToAdd) {
      try {
        await queryInterface.addIndex('users', index.fields, { name: index.name });
        console.log(`Added index: ${index.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`Index ${index.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    const indexesToRemove = ['users_rejected_by_idx', 'users_rejected_at_idx'];
    for (const indexName of indexesToRemove) {
      try {
        await queryInterface.removeIndex('users', indexName);
      } catch (error) {
        console.log(`Index ${indexName} might not exist, continuing...`);
      }
    }

    // Remove columns
    const columnsToRemove = ['rejected_by', 'rejected_at', 'rejection_reason'];

    for (const columnName of columnsToRemove) {
      try {
        await queryInterface.removeColumn('users', columnName);
      } catch (error) {
        console.log(`Column ${columnName} might not exist, continuing...`);
      }
    }
  }
};