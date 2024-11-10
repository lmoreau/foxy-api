import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listIncomingWirelinePaymentsByWonService(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const wonServiceID = request.query.get('wonServiceID');
        
        if (!wonServiceID) {
            return {
                ...corsResponse,
                status: 400,
                body: JSON.stringify({
                    error: "wonServiceID parameter is required"
                })
            };
        }

        // Build the query parameters
        const params = new URLSearchParams();
        
        // Filter by WON Service ID
        params.append('$filter', `_foxy_wonservice_value eq ${wonServiceID}`);
        
        // Add expand parameter
        params.append('$expand', 'foxy_WonService($select=foxy_serviceid)');
        
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_incomingpayments?${params.toString()}`;

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
        context.error('Error in listIncomingWirelinePayments:', error);
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

app.http('listIncomingWirelinePaymentsByWonService', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listIncomingWirelinePaymentsByWonService
});
