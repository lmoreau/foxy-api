import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function getRapidPlanalyzer(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const id = request.query.get('id') || request.params?.id;
        if (!id) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide id as a query parameter"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        const formattedId = id.replace(/[{}]/g, '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_presentations(${formattedId})?$select=crc9f_ledgersave`;

        const response = await axios.get(apiUrl, { headers });

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in getRapidPlanalyzer:', error);
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

app.http('getRapidPlanalyzer', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: getRapidPlanalyzer,
    route: 'getRapidPlanalyzer'
}); 