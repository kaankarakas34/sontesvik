const { sequelize } = require('./backend/src/models');

async function fixDatabase() {
  try {
    console.log('Checking IncentiveTypes table...');
    
    // Check current data
    const [incentiveTypes] = await sequelize.query('SELECT id, name, "sectorId" FROM "IncentiveTypes"');
    console.log('Found', incentiveTypes.length, 'incentive types');
    
    // Find an existing sector ID
    const [sectors] = await sequelize.query('SELECT id FROM "Sectors" LIMIT 1');
    if (sectors.length > 0) {
      const sectorId = sectors[0].id;
      console.log('Using sector ID:', sectorId);
      
      // Update null sectorId values to the existing sector ID
      await sequelize.query(`UPDATE "IncentiveTypes" SET "sectorId" = '${sectorId}' WHERE "sectorId" IS NULL`);
      console.log('Updated null sectorId values');
    } else {
      console.log('No sectors found, skipping sectorId update');
    }
    
    // Now try to sync the database
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    
    // Verify the ApplicationIncentives table exists
    const [results] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ApplicationIncentives')");
    console.log('ApplicationIncentives table exists:', results[0].exists);
    
  } catch (error) {
    console.error('Error fixing database:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDatabase();