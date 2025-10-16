const { sequelize } = require('./backend/src/models');

async function syncDatabase() {
  try {
    console.log('Syncing database...');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    
    console.log('Database synced successfully!');
    console.log('ApplicationIncentives table should now exist.');
    
    // Verify the table exists
    const [results] = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ApplicationIncentives')");
    console.log('ApplicationIncentives table exists:', results[0].exists);
    
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();