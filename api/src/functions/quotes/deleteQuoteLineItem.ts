import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function deleteQuoteLineItem(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    const userToken = request.headers.get('authorization');
    if (!userToken) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    const deleteId = request.query.get('id');
    if (!deleteId) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide a line item ID to delete" 
        };
    }

    try {
        const accessToken = userToken.replace('Bearer ', '');
        const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_foxyquoterequestlineitems(${deleteId})`;

        await axios.delete(apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            }
        });

        return { 
            ...corsResponse,
            status: 204,
            headers: corsResponse?.headers
        };
    } catch (error: unknown) {
        context.log(`Error deleting quote line item: ${error}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) 
            ? error.response?.data?.error?.message || error.message 
            : error instanceof Error ? error.message : String(error);
        return { 
            ...corsResponse,
            status, 
            body: `Error deleting quote line item: ${message}`
        };
    }
}

app.http('deleteQuoteLineItem', {
    methods: ['DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: deleteQuoteLineItem
}); 