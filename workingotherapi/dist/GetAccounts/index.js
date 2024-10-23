"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const getAccounts = async function (context, req) {
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
        }
        else if (accounts.length === 1) {
            context.res = {
                status: 200,
                body: {
                    message: `Found account: ${accounts[0].DisplayName}, GUID: ${accounts[0].accountid}`,
                    account: accounts[0]
                }
            };
        }
        else {
            const accountNames = accounts.map((account, index) => `${index + 1}. ${account.DisplayName}`).join('\n');
            context.res = {
                status: 200,
                body: {
                    message: `Multiple accounts found:\n${accountNames}`,
                    accounts: accounts
                }
            };
        }
    }
    catch (error) {
        context.log.error('Error occurred:', error instanceof Error ? error.message : 'Unknown error');
        context.res = {
            status: 500,
            body: { error: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` }
        };
    }
};
async function getAccessToken() {
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const dataverseUrl = process.env.DATAVERSE_URL;
    if (!tenantId || !clientId || !clientSecret || !dataverseUrl) {
        throw new Error('Missing required environment variables for authentication');
    }
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const data = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: `${dataverseUrl}/.default`
    };
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    try {
        const response = await axios_1.default.post(tokenUrl, qs_1.default.stringify(data), { headers });
        return response.data.access_token;
    }
    catch (error) {
        throw new Error(`Failed to obtain access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function queryDataverse(companyName, accessToken) {
    const dataverseUrl = process.env.DATAVERSE_URL;
    if (!dataverseUrl) {
        throw new Error('DATAVERSE_URL environment variable is not set');
    }
    const sanitizedDataverseUrl = dataverseUrl.endsWith('/') ? dataverseUrl.slice(0, -1) : dataverseUrl;
    const query = `accounts?$filter=contains(name, '${companyName}')&$select=name,foxy_duns,accountid`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
    };
    try {
        const response = await axios_1.default.get(`${sanitizedDataverseUrl}/api/data/v9.2/${query}`, { headers });
        return response.data.value.map(account => ({
            DisplayName: account.name,
            foxy_duns: account.foxy_duns,
            accountid: account.accountid
        }));
    }
    catch (error) {
        throw new Error(`Failed to query Dataverse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
exports.default = getAccounts;
//# sourceMappingURL=index.js.map