const { Sequelize } = require('sequelize');
require('dotenv').config({ path: 'backend/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function checkColumns() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    const query = `
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Incentives' 
      ORDER BY ordinal_position;
    `;
    
    const [results] = await sequelize.query(query);
    console.log('Incentives table columns:');
    results.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkColumns();