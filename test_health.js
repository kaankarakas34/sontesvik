const axios = require('axios');

async function testHealthEndpoint() {
  try {
    console.log('Testing health endpoint...');
    
    const response = await axios.get('http://localhost:5002/api/health');
    
    console.log('Health check response:', response.data);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testHealthEndpoint();