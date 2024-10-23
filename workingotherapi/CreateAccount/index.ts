import axios from 'axios';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

interface AccountData {
    accountid: string;
    [key: string]: any;
}

interface AccountLocationData {
    foxy_accountlocationid: string;
    [key: string]: any;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Processing HTTP request for CreateAccount.');

    try {
        const accountName = req.body && req.body.accountName;
        const buildingId = req.body && req.body.buildingId;
        const userToken = req.headers['authorization'];

        if (!accountName || !buildingId) {
            context.res = {
                status: 400,
                body: JSON.stringify({ error: "Please provide both 'accountName' and 'buildingId' in the request body." })
            };
            return;
        }

        if (!userToken) {
            context.res = {
                status: 401,
                body: JSON.stringify({ error: "Authorization header is missing." })
            };
            return;
        }

        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');

        const createdAccount = await createAccountInDataverse(context, accountName, accessToken);
        const createdAccountLocation = await createAccountLocationInDataverse(context, createdAccount.accountid, buildingId, accessToken);

        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: "Account and AccountLocation created successfully",
                accountId: createdAccount.accountid,
                accountLocationId: createdAccountLocation.foxy_accountlocationid
            })
        };
    } catch (error) {
        handleError(context, error);
    }
};

// Create Account in Dataverse
async function createAccountInDataverse(context: Context, accountName: string, accessToken: string): Promise<AccountData> {
    const dataverseUrl = process.env.DATAVERSE_URL;
    const sanitizedDataverseUrl = dataverseUrl!.endsWith('/') ? dataverseUrl!.slice(0, -1) : dataverseUrl;
    const endpoint = `${sanitizedDataverseUrl}/api/data/v9.2/accounts`;

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'return=representation'
    };

    const accountData = {
        name: accountName
    };

    try {
        const response = await axios.post(endpoint, accountData, { headers });
        return response.data;
    } catch (error) {
        context.log.error('Error creating account in Dataverse:', error);
        throw error;
    }
}

// Create AccountLocation in Dataverse
async function createAccountLocationInDataverse(context: Context, accountId: string, buildingId: string, accessToken: string): Promise<AccountLocationData> {
    const dataverseUrl = process.env.DATAVERSE_URL;
    const sanitizedDataverseUrl = dataverseUrl!.endsWith('/') ? dataverseUrl!.slice(0, -1) : dataverseUrl;
    const endpoint = `${sanitizedDataverseUrl}/api/data/v9.2/foxy_accountlocations`;

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'return=representation'
    };

    const accountLocationData = {
        "foxy_Account@odata.bind": `/accounts(${accountId})`,
        "foxy_Building@odata.bind": `/foxy_buildings(${buildingId})`
    };

    try {
        const response = await axios.post(endpoint, accountLocationData, { headers });
        return response.data;
    } catch (error) {
        context.log.error('Error creating account location in Dataverse:', error);
        throw error;
    }
}

// Handle Error Responses
function handleError(context: Context, error: any): void {
    context.log.error('Error occurred:', error);

    if (axios.isAxiosError(error) && error.response) {
        context.res = {
            status: error.response.status,
            body: JSON.stringify({ error: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}` })
        };
    } else if (axios.isAxiosError(error) && error.request) {
        context.res = {
            status: 503,
            body: JSON.stringify({ error: 'Service Unavailable: No response from external API.' })
        };
    } else {
        context.res = {
            status: 500,
            body: JSON.stringify({ error: `Unexpected Error: ${error instanceof Error ? error.message : 'Unknown error'}` })
        };
    }
}

export default httpTrigger;
