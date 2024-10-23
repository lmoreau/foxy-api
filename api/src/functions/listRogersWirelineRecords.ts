import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listRogersWirelineRecords(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    // Get authorization header from request
    const userToken = request.headers.get('authorization');
    if (!userToken) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    const accountId = request.query.get('accountId');
    if (!accountId) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide an account ID" 
        };
    }

    try {
        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        // Query for foxy_ROGERSWireline records where foxy_Account lookup matches the accountId
        const formattedAccountId = accountId.replace(/[{}]/g, '');
        const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_rogerswirelines?$filter=_foxy_account_value eq '${formattedAccountId}'`;

        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'Prefer': 'return=representation'
            }
        });

        return { 
            ...corsResponse,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.log(`Error retrieving Rogers wireline records: ${error}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving Rogers wireline records: ${message}`
        };
    }
}

app.http('listRogersWirelineRecords', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listRogersWirelineRecords
});
