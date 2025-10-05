'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('IncentiveDocuments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
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
      document_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'DocumentTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this document is required for this specific incentive'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Specific description for this document in context of this incentive'
      },
      description_en: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'English description for this document in context of this incentive'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order of documents for this incentive'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // Add indexes
    await queryInterface.addIndex('IncentiveDocuments', ['incentive_id']);
    await queryInterface.addIndex('IncentiveDocuments', ['document_type_id']);
    await queryInterface.addIndex('IncentiveDocuments', ['incentive_id', 'document_type_id'], {
      unique: true,
      name: 'unique_incentive_document'
    });
    await queryInterface.addIndex('IncentiveDocuments', ['is_required']);
    await queryInterface.addIndex('IncentiveDocuments', ['is_active']);
    await queryInterface.addIndex('IncentiveDocuments', ['sort_order']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('IncentiveDocuments');
  }
};