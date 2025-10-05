'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create IncentiveGuides table
    await queryInterface.createTable('IncentiveGuides', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      incentiveId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'incentive_id',
        references: {
          model: 'Incentives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Rich text content for the guide'
      },
      regulations: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Legal regulations and requirements'
      },
      requiredDocuments: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '[]',
        comment: 'Array of required document types and descriptions'
      },
      applicationSteps: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '[]',
        comment: 'Step-by-step application process'
      },
      eligibilityCriteria: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '{}',
        comment: 'Eligibility criteria and requirements'
      },
      deadlines: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '{}',
        comment: 'Important dates and deadlines'
      },
      contactInfo: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '{}',
        comment: 'Contact information for support'
      },
      faqs: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: '[]',
        comment: 'Frequently asked questions'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Version number for guide updates'
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'published_at'
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'created_by',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'updated_by',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'updated_at'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at'
      }
    });

    // Add indexes
    await queryInterface.addIndex('IncentiveGuides', ['incentive_id'], {
      name: 'incentive_guides_incentive_id_idx'
    });
    
    await queryInterface.addIndex('IncentiveGuides', ['is_active'], {
      name: 'incentive_guides_is_active_idx'
    });
    
    await queryInterface.addIndex('IncentiveGuides', ['published_at'], {
      name: 'incentive_guides_published_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('IncentiveGuides');
  }
};