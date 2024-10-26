const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    tokenUrl: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
    clientId: '53ea850e-bc3b-4705-83df-a1f4ea0e4fb4',
    username: 'foxyapi@infusion-rogers.com',
    password: 'JD5$&*@vhd@DFJ325!JD5$&*@vhd@DFJ325!',
    scope: 'https://foxy.crm3.dynamics.com/user_impersonation',
};

async function getDevToken() {
    try {
        const params = new URLSearchParams();
        params.append('client_id', config.clientId);
        params.append('grant_type', 'password');
        params.append('username', config.username);
        params.append('password', config.password);
        params.append('scope', config.scope);

        const response = await axios.post(config.tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const tokenData = {
            ...response.data,
            timestamp: Date.now(),
        };

        // Store token in a local file for reuse
        fs.writeFileSync(
            path.join(__dirname, '.dev-token.json'),
            JSON.stringify(tokenData, null, 2)
        );

        console.log('Token acquired and saved successfully!');
        console.log('Access token:', tokenData.access_token);
        console.log('Expires in:', tokenData.expires_in, 'seconds');
        
        return tokenData.access_token;
    } catch (error) {
        console.error('Error getting token:', error.response?.data || error.message);
        throw error;
    }
}

// Helper to check if existing token is valid
function getStoredToken() {
    try {
        const tokenPath = path.join(__dirname, '.dev-token.json');
        if (!fs.existsSync(tokenPath)) {
            return null;
        }

        const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        const elapsedTime = (Date.now() - tokenData.timestamp) / 1000;

        if (elapsedTime < tokenData.expires_in) {
            return tokenData.access_token;
        }
        return null;
    } catch {
        return null;
    }
}

// Main function that either returns stored token or gets new one
async function getToken() {
    const storedToken = getStoredToken();
    if (storedToken) {
        console.log('Using stored token');
        return storedToken;
    }
    return getDevToken();
}

// If running directly
if (require.main === module) {
    getToken()
        .then(token => {
            console.log('\nYou can use this token in your requests:');
            console.log('\nAuthorization: Bearer', token);
        })
        .catch(console.error);
}

module.exports = { getToken };
