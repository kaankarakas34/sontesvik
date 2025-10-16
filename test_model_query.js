const { Incentive, Sector, IncentiveType } = require('./backend/src/models');

async function testModelQuery() {
  try {
    console.log('Testing model query with associations...');
    
    // Test the exact query from the controller
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
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      order: [['title', 'ASC']],
      limit: 20,
      offset: 0
    });
    
    console.log('Query successful!');
    console.log('Count:', result.count);
    console.log('Rows:', result.rows.length);
    
  } catch (error) {
    console.error('Model Error:', error.message);
    console.error('Full error:', error);
  }
}

testModelQuery();