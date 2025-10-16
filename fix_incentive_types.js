const { sequelize } = require('./backend/src/models');

async function fixIncentiveTypes() {
  try {
    console.log('Fixing IncentiveTypes...');
    
    // First, update existing records to have a valid sectorId
    const [sectors] = await sequelize.query('SELECT id FROM "Sectors" LIMIT 1');
    if (sectors.length > 0) {
      const sectorId = sectors[0].id;
      console.log('Using sectorId:', sectorId);
      
      await sequelize.query(`
        UPDATE "IncentiveTypes" 
        SET "sectorId" = :sectorId 
        WHERE "sectorId" IS NULL
      `, {
        replacements: { sectorId }
      });
      console.log('Updated null sectorIds');
    }
    
    // Now make sectorId nullable (it should already be, but let's check)
    try {
      await sequelize.query(`
        ALTER TABLE "IncentiveTypes" 
        ALTER COLUMN "sectorId" DROP NOT NULL
      `);
      console.log('Made sectorId nullable');
    } catch (error) {
      console.log('sectorId might already be nullable or constraint not found');
    }
    
    // Verify the fix
    const [updated] = await sequelize.query('SELECT COUNT(*) FROM "IncentiveTypes" WHERE "sectorId" IS NULL');
    console.log('Records with null sectorId after fix:', updated[0].count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixIncentiveTypes();