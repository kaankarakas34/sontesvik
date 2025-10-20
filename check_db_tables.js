const { sequelize } = require('./backend/src/models');

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    // Check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Existing tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Check specific tables
    const requiredTables = ['DocumentTypes', 'IncentiveTypes', 'DocumentIncentiveMappings'];
    
    for (const tableName of requiredTables) {
      const [exists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        )
      `);
      console.log(`${tableName} exists: ${exists[0].exists}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();