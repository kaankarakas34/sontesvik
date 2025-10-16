const { Incentive, Sector, IncentiveType } = require('./backend/src/models');

async function testIncentiveQuery() {
  try {
    console.log('Testing incentive query with associations...');
    
    const result = await Incentive.findAndCountAll({
      where: { status: 'active' },
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name', 'code']
        },
        {
          model: IncentiveType,
          as: 'incentiveTypeModel',
          attributes: ['id', 'name', 'code']
        }
      ],
      limit: 1
    });
    
    console.log('Success! Found', result.count, 'incentives');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('SQL:', error.sql);
    console.error('Original error:', error.original);
  }
}

testIncentiveQuery();