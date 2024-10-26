const axios = require('axios');
const { getToken } = require('./get-dev-token');

// Example function to test an API endpoint
async function testApiEndpoint(endpoint, method = 'GET', data = null) {
    try {
        const token = await getToken();
        
        const config = {
            method,
            url: `http://localhost:7071/api/${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios(config);
        console.log(`${method} ${endpoint} Response:`, response.data);
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Example usage:
async function runTest() {
    try {
        // Example: Test getting an account
        await testApiEndpoint('getAccountById?id=your-account-id');

        // Example: Test creating a quote location
        const createData = {
            _foxy_building_value: "building-id",
            _foxy_quoterequest_value: "quote-request-id",
            _foxy_accountlocation_value: "account-location-id"
        };
        await testApiEndpoint('createFoxyQuoteRequestLocation', 'POST', createData);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run if called directly
if (require.main === module) {
    runTest();
}

module.exports = { testApiEndpoint };
