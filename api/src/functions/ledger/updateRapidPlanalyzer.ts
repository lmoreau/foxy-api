import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

interface UpdateRapidPlanalyzerRequest {
    id: string;
    ledgersave: string;
}

export async function updateRapidPlanalyzer(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const requestBody = await request.json() as UpdateRapidPlanalyzerRequest;
        if (!requestBody.id) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide id in the request body"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        const formattedId = requestBody.id.replace(/[{}]/g, '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_presentations(${formattedId})`;

        const updateData = {
            crc9f_ledgersave: requestBody.ledgersave
        };

        await axios.patch(apiUrl, updateData, { headers });

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ message: "Successfully updated rapid planalyzer" }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in updateRapidPlanalyzer:', error);
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

app.http('updateRapidPlanalyzer', {
    methods: ['PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: updateRapidPlanalyzer,
    route: 'updateRapidPlanalyzer'
}); 