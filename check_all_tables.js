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

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    // Check IncentiveTypes table
    console.log('\n=== IncentiveTypes table columns ===');
    const incentiveTypesQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'IncentiveTypes' 
      ORDER BY ordinal_position;
    `;
    
    const [incentiveTypesResults] = await sequelize.query(incentiveTypesQuery);
    incentiveTypesResults.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check Sectors table
    console.log('\n=== Sectors table columns ===');
    const sectorsQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Sectors' 
      ORDER BY ordinal_position;
    `;
    
    const [sectorsResults] = await sequelize.query(sectorsQuery);
    sectorsResults.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if incentive_type_id column exists in Incentives
    console.log('\n=== Checking if incentive_type_id exists in Incentives ===');
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Incentives' AND column_name = 'incentive_type_id';
    `;
    
    const [columnResult] = await sequelize.query(checkColumnQuery);
    if (columnResult.length > 0) {
      console.log('incentive_type_id column exists');
    } else {
      console.log('incentive_type_id column does NOT exist');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();