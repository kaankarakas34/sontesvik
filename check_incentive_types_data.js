const { sequelize } = require('./backend/src/models');

async function checkIncentiveTypesData() {
  try {
    console.log('Checking IncentiveTypes data...');
    
    // Get all IncentiveTypes
    const [records] = await sequelize.query('SELECT * FROM "IncentiveTypes"');
    console.log('IncentiveType records:', records);
    
    // Check for null sectorIds
    const [nullSectorIds] = await sequelize.query('SELECT COUNT(*) FROM "IncentiveTypes" WHERE "sectorId" IS NULL');
    console.log('Records with null sectorId:', nullSectorIds[0].count);
    
    // Check Sectors
    const [sectors] = await sequelize.query('SELECT * FROM "Sectors"');
    console.log('Available sectors:', sectors);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

checkIncentiveTypesData();