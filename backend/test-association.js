const { sequelize, Incentive, IncentiveType } = require('./src/models');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    // Test association
    const incentives = await Incentive.findAll({
      include: [{ model: IncentiveType, as: 'incentiveTypeModel' }],
      limit: 1
    });
    console.log('Association test result - incentives found:', incentives.length);
    
    if (incentives.length > 0) {
      console.log('First incentive:', incentives[0].title);
      console.log('Incentive type:', incentives[0].incentiveTypeModel ? incentives[0].incentiveTypeModel.name : 'No type found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

test();