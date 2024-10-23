const axios = require('axios');
const qs = require('qs');

module.exports = async function (context, req) {
    context.log('Processing HTTP request for GetAccounts.');

    const companyName = req.query.company_name || (req.body && req.body.company_name);
    if (!companyName) {
        context.res = {
            status: 400,
            body: { error: "Please provide a 'company_name' parameter in the query string or request body." }
        };
        return;
    }

    try {
        const accessToken = await getAccessToken();
        const accounts = await queryDataverse(companyName, accessToken);

        if (accounts.length === 0) {
            context.res = {
                status: 200,
                body: { message: "No results were found." }
            };
        } else if (accounts.length === 1) {
            context.res = {
                status: 200,
                body: {
                    message: `Found account: ${accounts[0].name}, GUID: ${accounts[0].accountid}`,
                    account: accounts[0]
                }
            };
        } else {
            const accountNames = accounts.map((account, index) => `${index + 1}. ${account.name}`).join('\n');
            context.res = {
                status: 200,
                body: {
                    message: `Multiple accounts found:\n${accountNames}`,
                    accounts: accounts
                }
            };
        }
    } catch (error) {
        context.log.error('Error occurred:', error.message);
        context.res = {
            status: 500,
            body: { error: `An error occurred: ${error.message}` }
        };
    }
};

async function getAccessToken() {
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const data = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: `${process.env.DATAVERSE_URL}/.default`
    };

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const response = await axios.post(tokenUrl, qs.stringify(data), { headers });
    return response.data.access_token;
}

async function queryDataverse(companyName, accessToken) {
    const dataverseUrl = process.env.DATAVERSE_URL;
    const sanitizedDataverseUrl = dataverseUrl.endsWith('/') ? dataverseUrl.slice(0, -1) : dataverseUrl;

    const query = `accounts?$filter=contains(name, '${companyName}')&$select=name,foxy_duns,accountid`;

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
    };

    const response = await axios.get(`${sanitizedDataverseUrl}/api/data/v9.2/${query}`, { headers });

    return response.data.value.map(account => ({
        DisplayName: account.name,
        foxy_duns: account.foxy_duns,
        accountid: account.accountid
    }));
}
