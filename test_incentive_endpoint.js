const axios = require('axios');

async function testIncentiveEndpoint() {
  try {
    console.log('Testing incentive endpoint directly...');
    
    const response = await axios.get('http://localhost:5002/api/incentive-selection/incentives', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MGU1ZjVjLWU3NDItNGQxYS1hMzJlLWY5NjY1YzY4MzY5MCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzI4ODk5MTU3LCJleHAiOjE3Mjg5ODU1NTd9.9rIi2GjCq8kGslCQj1ZU8f5zPHC1huZd1b9YxiXoXqU'
      }
    });
    
    console.log('Success! Found', response.data.data.incentives.length, 'incentives');
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testIncentiveEndpoint();