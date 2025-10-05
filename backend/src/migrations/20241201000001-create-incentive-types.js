'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('IncentiveTypes', {
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
      color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#3B82F6'
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('IncentiveTypes', ['name']);
    await queryInterface.addIndex('IncentiveTypes', ['code']);
    await queryInterface.addIndex('IncentiveTypes', ['isActive']);
    await queryInterface.addIndex('IncentiveTypes', ['sortOrder']);

    // Insert default incentive types
    await queryInterface.bulkInsert('IncentiveTypes', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Hibe',
        nameEn: 'Grant',
        code: 'GRANT',
        description: 'Geri ödemesiz mali destek',
        descriptionEn: 'Non-repayable financial support',
        color: '#10B981',
        icon: 'gift',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Kredi',
        nameEn: 'Loan',
        code: 'LOAN',
        description: 'Düşük faizli kredi desteği',
        descriptionEn: 'Low-interest loan support',
        color: '#3B82F6',
        icon: 'banknotes',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Vergi İndirimi',
        nameEn: 'Tax Reduction',
        code: 'TAX_REDUCTION',
        description: 'Vergi yükünün azaltılması',
        descriptionEn: 'Reduction of tax burden',
        color: '#F59E0B',
        icon: 'receipt-percent',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Vergi Muafiyeti',
        nameEn: 'Tax Exemption',
        code: 'TAX_EXEMPTION',
        description: 'Belirli vergilerden muafiyet',
        descriptionEn: 'Exemption from certain taxes',
        color: '#EF4444',
        icon: 'shield-check',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Sübvansiyon',
        nameEn: 'Subsidy',
        code: 'SUBSIDY',
        description: 'Devlet tarafından sağlanan mali destek',
        descriptionEn: 'Financial support provided by the government',
        color: '#8B5CF6',
        icon: 'currency-dollar',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('IncentiveTypes');
  }
};