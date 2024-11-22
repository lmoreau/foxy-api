import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

interface UpdateQuoteLineItemRequest {
    id: string;
    [key: string]: any;
}

export async function updateQuoteLineItem(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    try {
        const requestBody = await request.json() as UpdateQuoteLineItemRequest;
        if (!requestBody.id) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide id in the request body"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        const formattedId = requestBody.id.replace(/[{}]/g, '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequestlineitems(${formattedId})`;

        const { id, ...updateData } = requestBody;

        await axios.patch(apiUrl, updateData, { headers });

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ message: "Successfully updated quote line item" }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in updateQuoteLineItem:', error);
        if (axios.isAxiosError(error)) {
            context.log('Axios error response:', error.response?.data);
            return {
                ...corsResponse,
                status: error.response?.status || 500,
                body: JSON.stringify({
                    error: error.response?.data?.error?.message || error.message
                })
            };
        }
        
        return { 
            ...corsResponse,
            status: 500, 
            body: JSON.stringify({
                error: (error as Error).message
            })
        };
    }
}

app.http('updateQuoteLineItem', {
    methods: ['PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: updateQuoteLineItem
}); 