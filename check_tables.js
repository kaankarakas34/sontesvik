const { sequelize } = require('./backend/src/models');

async function checkTables() {
  try {
    console.log('Checking existing tables...');
    
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Existing tables:', results.map(r => r.table_name));
    
    // Check if applications table exists with different case
    const [applications] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'applications')");
    console.log('applications table exists:', applications[0].exists);
    
    // Check if Applications table exists with different case
    const [Applications] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Applications')");
    console.log('Applications table exists:', Applications[0].exists);
    
  } catch (error) {
    console.error('Error checking tables:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();