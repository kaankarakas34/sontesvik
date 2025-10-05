'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DocumentTypes', {
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
      category: {
        type: Sequelize.ENUM(
          'identity',
          'company',
          'financial',
          'legal',
          'technical',
          'application',
          'other'
        ),
        allowNull: false,
        defaultValue: 'other'
      },
      isRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      allowedExtensions: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
      },
      maxFileSize: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5242880, // 5MB in bytes
        comment: 'Maximum file size in bytes'
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

    // Indexes will be created automatically by Sequelize based on model definition

    // Insert default document types
    await queryInterface.bulkInsert('DocumentTypes', [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Kimlik Belgesi',
        nameEn: 'Identity Document',
        code: 'IDENTITY',
        description: 'T.C. Kimlik Kartı veya Nüfus Cüzdanı',
        descriptionEn: 'Turkish ID Card or Population Registry',
        category: 'identity',
        isRequired: true,
        allowedExtensions: JSON.stringify(['pdf', 'jpg', 'jpeg', 'png']),
        maxFileSize: 2097152, // 2MB
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        name: 'Vergi Levhası',
        nameEn: 'Tax Plate',
        code: 'TAX_PLATE',
        description: 'Şirket vergi levhası',
        descriptionEn: 'Company tax plate',
        category: 'company',
        isRequired: true,
        allowedExtensions: JSON.stringify(['pdf', 'jpg', 'jpeg', 'png']),
        maxFileSize: 2097152, // 2MB
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440003',
        name: 'Ticaret Sicil Gazetesi',
        nameEn: 'Trade Registry Gazette',
        code: 'TRADE_REGISTRY',
        description: 'Ticaret sicil gazetesi',
        descriptionEn: 'Trade registry gazette',
        category: 'company',
        isRequired: true,
        allowedExtensions: JSON.stringify(['pdf']),
        maxFileSize: 5242880, // 5MB
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440004',
        name: 'Mali Müşavir Onay Belgesi',
        nameEn: 'Financial Advisor Approval Document',
        code: 'FINANCIAL_ADVISOR',
        description: 'Mali müşavir tarafından onaylanmış belge',
        descriptionEn: 'Document approved by financial advisor',
        category: 'financial',
        isRequired: false,
        allowedExtensions: JSON.stringify(['pdf', 'doc', 'docx']),
        maxFileSize: 5242880, // 5MB
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440005',
        name: 'Bilanço',
        nameEn: 'Balance Sheet',
        code: 'BALANCE_SHEET',
        description: 'Şirket bilançosu',
        descriptionEn: 'Company balance sheet',
        category: 'financial',
        isRequired: false,
        allowedExtensions: JSON.stringify(['pdf', 'xls', 'xlsx']),
        maxFileSize: 10485760, // 10MB
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440006',
        name: 'Proje Dosyası',
        nameEn: 'Project File',
        code: 'PROJECT_FILE',
        description: 'Proje detayları ve teknik dökümanlar',
        descriptionEn: 'Project details and technical documents',
        category: 'technical',
        isRequired: false,
        allowedExtensions: JSON.stringify(['pdf', 'doc', 'docx', 'zip', 'rar']),
        maxFileSize: 52428800, // 50MB
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DocumentTypes');
  }
};