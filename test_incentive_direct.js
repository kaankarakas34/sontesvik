const axios = require('axios');

async function testIncentiveEndpointDirect() {
  try {
    console.log('Testing incentive endpoint without auth...');
    
    const response = await axios.get('http://localhost:5002/api/incentive-selection/incentives');
    
    console.log('Success! Found', response.data.data.incentives.length, 'incentives');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testIncentiveEndpointDirect();