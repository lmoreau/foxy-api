import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listAccountsForResidualCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        // Use proper OData query for Dataverse with all required fields
        const apiUrl = `${dataverseUrl}/api/data/v9.2/accounts?$select=crc9f_residuallastscrub,accountid,name,foxy_duns,foxy_cable,foxy_datacentre,foxy_fibreinternet,foxy_gpon,foxy_microsoft365,foxy_res,foxy_sip,foxy_unison,foxyflow_residualstotal,foxyflow_residualsnotes,foxy_ritaresidualnotes,foxy_wirelinemrr,foxyflow_wirelineresiduals&$filter=statecode eq 0 and foxy_basecustomer eq 612100001`;

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
        context.error('Error in listAccountsForResidualCheck:', error);
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

app.http('listAccountsForResidualCheck', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listAccountsForResidualCheck
});
