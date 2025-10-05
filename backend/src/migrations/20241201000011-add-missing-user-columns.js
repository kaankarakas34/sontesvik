'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to users table
    const columnsToAdd = [
      {
        name: 'avatar',
        definition: {
          type: Sequelize.STRING,
          allowNull: true
        }
      },
      {
        name: 'city',
        definition: {
          type: Sequelize.STRING(50),
          allowNull: true
        }
      },
      {
        name: 'country',
        definition: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: 'Turkey'
        }
      },
      {
        name: 'email_verified',
        definition: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        }
      },
      {
        name: 'email_verification_token',
        definition: {
          type: Sequelize.STRING,
          allowNull: true
        }
      },
      {
        name: 'email_verification_expires',
        definition: {
          type: Sequelize.DATE,
          allowNull: true
        }
      },
      {
        name: 'password_reset_token',
        definition: {
          type: Sequelize.STRING,
          allowNull: true
        }
      },
      {
        name: 'password_reset_expires',
        definition: {
          type: Sequelize.DATE,
          allowNull: true
        }
      },
      {
        name: 'refresh_token',
        definition: {
          type: Sequelize.TEXT,
          allowNull: true
        }
      },
      {
        name: 'login_attempts',
        definition: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        }
      },
      {
        name: 'lock_until',
        definition: {
          type: Sequelize.DATE,
          allowNull: true
        }
      },
      {
        name: 'sector',
        definition: {
          type: Sequelize.ENUM('technology', 'manufacturing', 'healthcare', 'education', 'finance', 'retail', 'construction', 'agriculture', 'energy', 'tourism', 'other'),
          allowNull: true
        }
      },
      {
        name: 'approved_by',
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
        name: 'approved_at',
        definition: {
          type: Sequelize.DATE,
          allowNull: true
        }
      },
      {
        name: 'company_tax_number',
        definition: {
          type: Sequelize.STRING(20),
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
      { fields: ['sector'], name: 'users_sector_idx' },
      { fields: ['approved_by'], name: 'users_approved_by_idx' },
      { fields: ['approved_at'], name: 'users_approved_at_idx' }
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
    const indexesToRemove = ['users_sector_idx', 'users_approved_by_idx', 'users_approved_at_idx'];
    for (const indexName of indexesToRemove) {
      try {
        await queryInterface.removeIndex('users', indexName);
      } catch (error) {
        console.log(`Index ${indexName} might not exist, continuing...`);
      }
    }

    // Remove columns
    const columnsToRemove = [
      'avatar', 'city', 'country', 'email_verified', 'email_verification_token',
      'email_verification_expires', 'password_reset_token', 'password_reset_expires',
      'refresh_token', 'login_attempts', 'lock_until', 'sector', 'approved_by', 'approved_at',
      'company_tax_number'
    ];

    for (const columnName of columnsToRemove) {
      try {
        await queryInterface.removeColumn('users', columnName);
      } catch (error) {
        console.log(`Column ${columnName} might not exist, continuing...`);
      }
    }
  }
};