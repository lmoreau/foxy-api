import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listWonServices(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const headers = getDataverseHeaders(authHeader);
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices?$select=foxy_serviceid,foxy_comprate,foxy_expectedcomp,foxy_term,foxy_tcv,foxy_access,foxy_mrr,foxy_quantity,foxy_linemargin,foxy_wonserviceid`;

        context.log('Using auth header:', authHeader.substring(0, 50) + '...');
        context.log('Calling URL:', apiUrl);

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
        context.error('Error in listWonServices:', error);
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

app.http('listWonServices', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listWonServices
});
