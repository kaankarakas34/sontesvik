const { sequelize } = require('./backend/src/models');

async function testIncentiveQuery() {
  try {
    console.log('Testing incentive query...');
    
    // Simple query to see what works
    const [results] = await sequelize.query('SELECT * FROM "Incentives" LIMIT 1');
    console.log('Query successful, found:', results.length, 'incentives');
    
  } catch (error) {
    console.error('SQL Error:', error.message);
    console.error('Error details:', error);
  } finally {
    await sequelize.close();
  }
}

testIncentiveQuery();