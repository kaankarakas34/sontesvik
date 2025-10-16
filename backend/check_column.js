const { sequelize } = require('./src/models');

async function checkColumn() {
  try {
    const [results] = await sequelize.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'Applications' AND column_name = 'incentive_id'");
    console.log('incentive_id column:', results[0]);
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

checkColumn();