import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function updateWonService(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    // Get ID from URL path
    const urlParts = request.url.split('/');
    const idMatch = urlParts[urlParts.length - 1].match(/\((.*?)\)/);
    if (!idMatch) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide a GUID in the URL path like: foxy_wonservices(guid)"
        };
    }
    const id = idMatch[1];

    try {
        const requestBody = await request.json();
        if (!requestBody || Object.keys(requestBody).length === 0) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide update fields in the request body"
            };
        }

        // Format the GUID properly for Dataverse
        const formattedId = id.replace(/[{}]/g, '');
        const headers = getDataverseHeaders(authHeader);
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices(${formattedId})`;

        context.log('Using auth header:', authHeader.substring(0, 50) + '...');
        context.log('Calling URL:', apiUrl);
        context.log('Request body:', requestBody);

        await axios.patch(apiUrl, requestBody, { headers });

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ message: "Successfully updated won service" }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in updateWonService:', error);
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

app.http('updateWonService', {
    methods: ['PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    route: 'foxy_wonservices({id})',  // This matches the Dataverse URL pattern
    handler: updateWonService
});
