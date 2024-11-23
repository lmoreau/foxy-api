import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function listMasterResidualBillingRows(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const ban = request.query.get('ban') || '';
        
        // If no BAN provided, return empty result
        if (!ban) {
            return {
                ...corsResponse,
                body: JSON.stringify({
                    "@odata.context": "",
                    "value": []
                }),
                headers: {
                    "Content-Type": "application/json",
                    ...corsResponse?.headers
                }
            };
        }

        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_billingrecords?$filter=foxy_ban eq '${ban}'&$orderby=foxy_billedmonthyear desc`;

        context.log('Using auth header:', authHeader.substring(0, 50) + '...');
        context.log('Calling URL:', apiUrl);
        context.log('BAN parameter:', ban);

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
        context.error('Error in listMasterResidualBillingRows:', error);
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

app.http('listMasterResidualBillingRows', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listMasterResidualBillingRows
});
