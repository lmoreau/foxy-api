import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listAccountsForResidualCheck(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.1/accounts?$filter=foxy_basecustomer eq 612100001&$select=accountid,name,foxy_basecheck,foxy_basechecknotes,foxy_basecustomer,foxy_cable,foxy_datacentre,foxy_duns,foxy_fibreinternet,foxy_gpon,foxy_microsoft365,foxy_res,foxyflow_residualstotal,foxyflow_residualsnotes,foxy_ritaresidualnotes,foxy_sip,foxy_unison,foxy_wirelinemrr,foxyflow_wirelineresiduals`;

        const response = await axios.get(apiUrl, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            }
        });

        return { 
            ...corsResponse,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.log(`Error retrieving accounts for residual check: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving accounts for residual check: ${message}`
        };
    }
}

app.http('listAccountsForResidualCheck', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listAccountsForResidualCheck
});
