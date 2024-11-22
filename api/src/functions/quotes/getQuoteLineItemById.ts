import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function getQuoteLineItemById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    const id = request.query.get('id') || await request.text();
    if (!id) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide a GUID for the quote line item" 
        };
    }

    try {
        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequestlineitems(${id})?$expand=foxy_Product`;

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
    } catch (error: unknown) {
        context.log(`Error retrieving quote line item: ${error}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) 
            ? error.response?.data?.error?.message || error.message 
            : error instanceof Error ? error.message : String(error);
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving quote line item: ${message}`
        };
    }
}

app.http('getQuoteLineItemById', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: getQuoteLineItemById
});
