const axios = require('axios');

async function testApi() {
  try {
    console.log('Sending request to API...');
    const response = await axios.get('http://localhost:7071/api/listQuoteLocationRows?quoteId=db98155d-4474-ef11-ac20-002248b25d17');
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    console.log('API Response Data:', response.data);
  } catch (error) {
    console.error('Error accessing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error details:', error);
    }
  }
}

testApi();
