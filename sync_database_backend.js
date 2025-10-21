const { sequelize } = require('./src/models');

async function syncDatabase() {
  try {
    console.log('Syncing database...');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    
    console.log('Database synced successfully!');
    console.log('All tables should now exist.');
    
    // Verify the tables exist
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Existing tables:', results.map(r => r.table_name));
    
  } catch (error) {
    console.error('Error syncing database:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();