const axios = require('axios');

async function testCreateApplication() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2ZmEwNWQ4LThhZDQtNDU1Yi1hZTRlLTM3MjgzMmQ4YmUwYyIsImVtYWlsIjoibWVtYmVyQGV4YW1wbGUuY29tIiwicm9sZSI6Im1lbWJlciIsImlhdCI6MTc2MDUyNTMwNSwiZXhwIjoxNzYwNjExNzA1fQ.MxUugjHL2JN7tseS0XYuZRP7kvJGWMAHa5ynkR_-egA";
  
  try {
    // First, get available incentives
    console.log('Getting available incentives...');
    const incentivesResponse = await axios.get('http://localhost:5002/api/incentive-selection/incentives', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Incentives found:', incentivesResponse.data.data.incentives?.length || 0);
    
    if (!incentivesResponse.data.data.incentives || incentivesResponse.data.data.incentives.length === 0) {
      console.log('No incentives available');
      return;
    }
    
    // Use the first available incentive
    const incentiveId = incentivesResponse.data.data.incentives[0].id;
    console.log('Using incentive ID:', incentiveId);
    
    // Create application with incentive
    console.log('Creating application...');
    const applicationData = {
      applicationData: {
        projectTitle: "Test Project",
        projectDescription: "Test project description",
        requestedAmount: 100000,
        currency: "TRY",
        priority: "medium",
        sectorId: "Yazılım",
        completionPercentage: 0,
        notes: "Test notes"
      },
      incentiveIds: [incentiveId]
    };
    
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
    
    console.log('Application created successfully!');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status) {
      console.error('HTTP Status:', error.response.status);
    }
    if (error.response?.headers) {
      console.error('Response headers:', error.response.headers);
    }
  }
}

testCreateApplication();