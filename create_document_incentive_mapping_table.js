const { sequelize } = require('./backend/src/models');

async function createDocumentIncentiveMappingTable() {
  try {
    console.log('Creating DocumentIncentiveMappings table...');
    
    // Create the table manually
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "DocumentIncentiveMappings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "documentTypeId" UUID NOT NULL REFERENCES "DocumentTypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "incentiveTypeId" UUID NOT NULL REFERENCES "IncentiveTypes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "isRequired" BOOLEAN NOT NULL DEFAULT true,
        "description" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdBy" UUID REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "updatedBy" UUID REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Add comments
    await sequelize.query(`
      COMMENT ON COLUMN "DocumentIncentiveMappings"."isRequired" IS 'Bu belge türü bu teşvik için zorunlu mu?';
      COMMENT ON COLUMN "DocumentIncentiveMappings"."description" IS 'Bu eşleştirme için özel açıklama';
      COMMENT ON COLUMN "DocumentIncentiveMappings"."sortOrder" IS 'Belgelerin sıralama düzeni';
      COMMENT ON COLUMN "DocumentIncentiveMappings"."isActive" IS 'Bu eşleştirme aktif mi?';
    `);
    
    // Create indexes
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "unique_document_incentive_mapping" 
      ON "DocumentIncentiveMappings" ("documentTypeId", "incentiveTypeId");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "DocumentIncentiveMappings_documentTypeId" 
      ON "DocumentIncentiveMappings" ("documentTypeId");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "DocumentIncentiveMappings_incentiveTypeId" 
      ON "DocumentIncentiveMappings" ("incentiveTypeId");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "DocumentIncentiveMappings_isRequired" 
      ON "DocumentIncentiveMappings" ("isRequired");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "DocumentIncentiveMappings_isActive" 
      ON "DocumentIncentiveMappings" ("isActive");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "DocumentIncentiveMappings_sortOrder" 
      ON "DocumentIncentiveMappings" ("sortOrder");
    `);
    
    console.log('DocumentIncentiveMappings table created successfully!');
    
    // Verify table creation
    const [exists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'DocumentIncentiveMappings'
      )
    `);
    
    console.log('Table exists:', exists[0].exists);
    
  } catch (error) {
    console.error('Error creating table:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

createDocumentIncentiveMappingTable();