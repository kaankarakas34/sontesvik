'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add consultant specific columns to users table
    const columnsToAdd = [
      {
        name: 'consultant_rating',
        definition: {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: true,
          defaultValue: null,
          validate: {
            min: 1.0,
            max: 5.0
          }
        }
      },
      {
        name: 'consultant_review_count',
        definition: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        name: 'consultant_bio',
        definition: {
          type: Sequelize.TEXT,
          allowNull: true
        }
      },
      {
        name: 'consultant_specializations',
        definition: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: '[]'
        }
      },
      {
        name: 'consultant_status',
        definition: {
          type: Sequelize.ENUM('active', 'inactive', 'busy', 'on_leave'),
          allowNull: false,
          defaultValue: 'inactive'
        }
      },
      {
        name: 'max_concurrent_applications',
        definition: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 10
        }
      },
      {
        name: 'assigned_by',
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
        name: 'assigned_at',
        definition: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }
    ];

    // Add each column
    for (const column of columnsToAdd) {
      try {
        await queryInterface.addColumn('users', column.name, column.definition);
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Column ${column.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding column ${column.name}:`, error.message);
          throw error;
        }
      }
    }

    // Add indexes for better performance
    const indexesToAdd = [
      { fields: ['consultant_rating'], name: 'users_consultant_rating_idx' },
      { fields: ['consultant_status'], name: 'users_consultant_status_idx' },
      { fields: ['assigned_by'], name: 'users_assigned_by_idx' },
      { fields: ['assigned_at'], name: 'users_assigned_at_idx' }
    ];

    for (const index of indexesToAdd) {
      try {
        await queryInterface.addIndex('users', index.fields, { name: index.name });
        console.log(`✅ Added index: ${index.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Index ${index.name} already exists, skipping...`);
        } else {
          console.error(`❌ Error adding index ${index.name}:`, error.message);
          throw error;
        }
      }
    }

    console.log('🎉 Consultant fields migration completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    const indexesToRemove = [
      'users_consultant_rating_idx',
      'users_consultant_status_idx', 
      'users_assigned_by_idx',
      'users_assigned_at_idx'
    ];
    
    for (const indexName of indexesToRemove) {
      try {
        await queryInterface.removeIndex('users', indexName);
        console.log(`✅ Removed index: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Index ${indexName} might not exist, continuing...`);
      }
    }

    // Remove ENUM type first (consultant_status)
    try {
      await queryInterface.removeColumn('users', 'consultant_status');
      console.log('✅ Removed consultant_status column');
    } catch (error) {
      console.log('⚠️ consultant_status column might not exist, continuing...');
    }

    // Remove other columns
    const columnsToRemove = [
      'consultant_rating',
      'consultant_review_count',
      'consultant_bio',
      'consultant_specializations',
      'max_concurrent_applications',
      'assigned_by',
      'assigned_at'
    ];

    for (const columnName of columnsToRemove) {
      try {
        await queryInterface.removeColumn('users', columnName);
        console.log(`✅ Removed column: ${columnName}`);
      } catch (error) {
        console.log(`⚠️ Column ${columnName} might not exist, continuing...`);
      }
    }

    console.log('🎉 Consultant fields rollback completed successfully!');
  }
};