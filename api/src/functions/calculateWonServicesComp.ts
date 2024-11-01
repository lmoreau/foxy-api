import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

interface CalculateCompRequest {
    ids: string[];
}

export async function calculateWonServicesComp(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    try {
        const requestBody = await request.json() as CalculateCompRequest;
        if (!requestBody.ids || !Array.isArray(requestBody.ids) || requestBody.ids.length === 0) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide an array of won service IDs in the request body"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        const results = [];

        // For now, just set expectedcomp to 5 for each ID
        for (const id of requestBody.ids) {
            const formattedId = id.replace(/[{}]/g, '');
            const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices(${formattedId})`;
            
            await axios.patch(apiUrl, {
                foxy_expectedcomp: 5.00
            }, { headers });

            results.push({ id, status: 'updated' });
        }

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ 
                message: "Successfully updated compensation values",
                results 
            }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in calculateWonServicesComp:', error);
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

app.http('calculateWonServicesComp', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: calculateWonServicesComp
});
