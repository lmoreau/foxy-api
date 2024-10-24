import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listOpportunityRows(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    const searchParams = new URL(request.url).searchParams;
    const accountId = searchParams.get('accountId');
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
        // Update the filter to use the correct logical name
        const apiUrl = `${dataverseUrl}/api/data/v9.2/opportunities?$filter=_customerid_value eq ${accountId}`;

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
        context.log(`Error retrieving opportunity rows: ${error}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving opportunity rows: ${message}`
        };
    }
}

app.http('listOpportunityRows', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listOpportunityRows
});
