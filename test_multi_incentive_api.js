const axios = require('axios');

async function testMultiIncentiveAPI() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2ZmEwNWQ4LThhZDQtNDU1Yi1hZTRlLTM3MjgzMmQ4YmUwYyIsImVtYWlsIjoibWVtYmVyQGV4YW1wbGUuY29tIiwicm9sZSI6Im1lbWJlciIsImlhdCI6MTc2MDU0Mzg2NywiZXhwIjoxNzYwNjMwMjY3fQ.5SCHJDuSmXLgFGGbT3JYMvQsuSK5Gx6TpdV5k4hiBew";
  
  try {
    console.log('=== Multi-Incentive Application API Test ===\n');
    
    // 1. Get available incentives first
    console.log('1. Getting available incentives...');
    const incentivesResponse = await axios.get('http://localhost:5002/api/incentive-selection/incentives', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Incentives found:', incentivesResponse.data.data.incentives?.length || 0);
    
    if (!incentivesResponse.data.data.incentives || incentivesResponse.data.data.incentives.length === 0) {
      console.log('❌ No incentives available for testing');
      return;
    }
    
    // Use first two incentives for testing
    const availableIncentives = incentivesResponse.data.data.incentives;
    const testIncentiveIds = availableIncentives.slice(0, Math.min(2, availableIncentives.length)).map(inc => inc.id);
    
    console.log('✓ Using incentive IDs for test:', testIncentiveIds);
    console.log('');
    
    // 2. Test the exact same request that frontend makes
    console.log('2. Creating multi-incentive application...');
    const applicationData = {
      applicationData: {
        projectTitle: `Çoklu Teşvik Başvurusu - ${testIncentiveIds.length} adet teşvik`,
        projectDescription: `Kullanıcı tarafından seçilen ${testIncentiveIds.length} adet teşvik için ortak başvuru`,
        requestedAmount: 0,
        currency: 'TRY',
        priority: 'medium',
        sector: 'Genel'
      },
      incentiveIds: testIncentiveIds.map(id => parseInt(id)) // String'den integer'a çevir
    };
    
    console.log('Request data:', JSON.stringify(applicationData, null, 2));
    console.log('');
    
    const createResponse = await axios.post(
      'http://localhost:5002/api/incentive-selection/applications/with-incentives',
      applicationData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Application created successfully!');
    console.log('Response status:', createResponse.status);
    console.log('Response data:', JSON.stringify(createResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    console.error('Full error object:', error);
  }
}

testMultiIncentiveAPI();