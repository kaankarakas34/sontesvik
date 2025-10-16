const { Incentive } = require('./backend/src/models');

async function testIncentives() {
  try {
    const incentives = await Incentive.findAll({ limit: 5 });
    console.log('Available incentives:');
    console.log(JSON.stringify(incentives, null, 2));
    
    if (incentives.length > 0) {
      console.log('\nFirst incentive ID:', incentives[0].id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testIncentives();