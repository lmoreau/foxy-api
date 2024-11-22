import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function recalculateWonServicePayments(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        // Get the won service ID from the request parameters
        const wonServiceId = request.query.get('wonServiceId');
        if (!wonServiceId) {
            return {
                ...corsResponse,
                status: 400,
                body: "wonServiceId parameter is required"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        
        // Construct the request body for calculating rollup field
        const requestBody = {
            Target: {
                "@odata.type": "Microsoft.Dynamics.CRM.foxy_wonservice",
                "foxy_wonserviceid": wonServiceId
            },
            FieldName: "foxy_totalinpayments"
        };

        // Make the POST request to recalculate the rollup field
        const apiUrl = `${dataverseUrl}/api/data/v9.2/CalculateRollupField`;
        const response = await axios.post(apiUrl, requestBody, { headers });

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({
                message: "Recalculation triggered successfully",
                data: response.data
            }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in recalculateWonServicePayments:', error);
        if (axios.isAxiosError(error)) {
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

app.http('recalculateWonServicePayments', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: recalculateWonServicePayments
});
