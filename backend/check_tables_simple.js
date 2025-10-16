const { sequelize } = require('./src/models');

async function checkTables() {
  try {
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tüm tablolar:');
    results.forEach(row => {
      console.log(row.table_name);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

checkTables();