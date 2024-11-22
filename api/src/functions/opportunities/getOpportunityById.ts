import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function getOpportunityById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
            body: "Please provide a GUID for the opportunity" 
        };
    }

    try {
        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/opportunities(${id})`;

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
        context.log(`Error retrieving opportunity:`, error);
        
        let status = 500;
        let message = 'An unknown error occurred';
        
        if (axios.isAxiosError(error)) {
            status = error.response?.status || 500;
            message = error.response?.data?.error?.message || error.message;
        } else if (error instanceof Error) {
            message = error.message;
        }
        
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving opportunity: ${message}`
        };
    }
}

app.http('getOpportunityById', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: getOpportunityById
});
