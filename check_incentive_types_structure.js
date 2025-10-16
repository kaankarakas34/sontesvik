const { sequelize } = require('./backend/src/models');

async function checkIncentiveTypesStructure() {
  try {
    console.log('Checking IncentiveTypes table structure...');
    
    // Get table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'IncentiveTypes' 
      ORDER BY ordinal_position
    `);
    
    console.log('IncentiveTypes columns:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}, nullable: ${col.is_nullable}, default: ${col.column_default}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkIncentiveTypesStructure();