import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders, getAuthToken } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function getAccountById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Processing getAccountById request');
    
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    const authToken = getAuthToken(request);
    if (!authToken) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get('id');
    if (!id) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide a GUID for the account" 
        };
    }

    try {
        if (!dataverseUrl) {
            throw new Error('DATAVERSE_URL environment variable is not set');
        }

        const headers = getDataverseHeaders(authToken);
        const apiUrl = `${dataverseUrl}/api/data/v9.2/accounts(${id})`;

        context.log('Calling Dataverse API:', apiUrl);
        const response = await axios.get(apiUrl, { headers });

        return { 
            ...corsResponse,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in getAccountById:', error);
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

app.http('getAccountById', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: getAccountById
});
