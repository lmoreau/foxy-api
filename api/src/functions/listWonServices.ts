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
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices?$select=foxy_renewaldisposition,statuscode,foxyflow_internalnotes,foxy_infusionpaymentstatus,foxy_renewaltype,foxy_access,foxy_contractstart,foxy_monthtotermend,foxy_quantity,foxy_mrr,foxy_tcv,foxy_comprate,foxy_wonserviceid,foxy_serviceid,foxy_sololine,statecode,foxy_upselltype,foxy_renewaloverridereason,foxy_revenuetype,foxy_linemargin,foxy_contractend,foxy_term,foxy_inpaymentstatus,foxy_mrruptick,foxy_expectedcomp&$expand=foxy_Product($select=name),foxy_Account($select=name),foxy_Opportunity($select=name,foxy_sfdcoppid,actualclosedate,actualvalue),foxy_AccountLocation($expand=foxy_Building($select=foxy_fulladdress))`;

        context.log('Using auth header:', authHeader.substring(0, 50) + '...');
        context.log('Calling URL:', apiUrl);

        const response = await axios.get(apiUrl, { headers });
        
        // Log the first item of the response for debugging
        if (response.data.value && response.data.value.length > 0) {
            context.log('First item in response:', JSON.stringify(response.data.value[0], null, 2));
        }

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
