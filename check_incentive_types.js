const { sequelize } = require('./backend/src/models');

async function checkIncentiveTypes() {
  try {
    console.log('Checking IncentiveTypes...');
    
    // Check if IncentiveTypes table exists
    const [tableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'IncentiveTypes'
      )
    `);
    console.log('IncentiveTypes table exists:', tableExists.exists);
    
    if (tableExists.exists) {
      // Check records
      const [records] = await sequelize.query('SELECT * FROM "IncentiveTypes" LIMIT 5');
      console.log('IncentiveType records:', records);
      
      // Check for null sectorIds
      const [nullSectorIds] = await sequelize.query('SELECT COUNT(*) FROM "IncentiveTypes" WHERE "sectorId" IS NULL');
      console.log('Records with null sectorId:', nullSectorIds[0].count);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkIncentiveTypes();