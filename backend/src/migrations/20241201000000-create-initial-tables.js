'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Sectors table
    await queryInterface.createTable('Sectors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      name_en: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      descriptionEn: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      incentive_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      user_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '{}'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create IncentiveCategories table
    await queryInterface.createTable('IncentiveCategories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      nameEn: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      description_en: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'company', 'consultant'),
        allowNull: false,
        defaultValue: 'company'
      },
      company_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tax_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sector_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_approved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Incentives table
    await queryInterface.createTable('Incentives', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      short_description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      incentive_type: {
        type: Sequelize.ENUM(
          'grant',
          'loan',
          'tax_reduction',
          'tax_exemption',
          'subsidy',
          'other'
        ),
        allowNull: false,
        defaultValue: 'grant'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'TRY'
      },
      application_start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      application_end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'IncentiveCategories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sector_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Applications table
    await queryInterface.createTable('Applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      incentive_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Incentives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create Documents table
    await queryInterface.createTable('Documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      original_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      document_type: {
        type: Sequelize.ENUM(
          'identity',
          'tax_plate',
          'trade_registry',
          'financial_statement',
          'project_document',
          'other'
        ),
        allowNull: false,
        defaultValue: 'other'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      application_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes (with IF NOT EXISTS check)
    try {
      await queryInterface.addIndex('users', ['email'], { name: 'users_email' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('users', ['role'], { name: 'users_role' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('users', ['sector_id'], { name: 'users_sector_id' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('Applications', ['user_id'], { name: 'applications_user_id' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('Applications', ['incentive_id'], { name: 'applications_incentive_id' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('Applications', ['status'], { name: 'applications_status' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('Documents', ['user_id'], { name: 'documents_user_id' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('Documents', ['application_id'], { name: 'documents_application_id' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('Incentives', ['category_id'], { name: 'incentives_category_id' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
    
    try {
      await queryInterface.addIndex('Incentives', ['sector_id'], { name: 'incentives_sector_id' });
    } catch (error) {
      if (!error.message.includes('already exists')) throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Kullanıcı tablosu asla silinmemeli - sadece diğer tabloları sil
    await queryInterface.dropTable('Documents');
    await queryInterface.dropTable('Applications');
    await queryInterface.dropTable('Incentives');
    await queryInterface.dropTable('IncentiveCategories');
    await queryInterface.dropTable('Sectors');
    // users tablosu silinmeyecek - kullanıcılar kalıcıdır
    console.log('⚠️  Users table NOT dropped - users are permanent entities');
  }
};