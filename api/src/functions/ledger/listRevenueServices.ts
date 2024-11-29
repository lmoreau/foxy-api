import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function listRevenueServices(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('🟦 listRevenueServices function triggered');
    context.log(`🟦 Request URL: ${request.url}`);
    context.log(`🟦 Request method: ${request.method}`);

    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        context.log('🟦 Handling CORS preflight request');
        return corsResponse;
    }

    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        context.log('🔴 Missing authorization header');
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    try {
        const searchParams = new URL(request.url).searchParams;
        const filter = searchParams.get('filter') || '';
        context.log(`🟦 Received filter parameter: ${filter}`);

        const headers = getDataverseHeaders(authHeader);
        const selectFields = [
            'crc9f_existingmrr',
            'crc9f_expectedcompbreakdown',
            'foxy_renewaldisposition',
            'statuscode',
            'foxyflow_internalnotes',
            'foxy_infusionpaymentstatus',
            'foxy_renewaltype',
            'foxy_access',
            'foxy_contractstart',
            'foxy_monthtotermend',
            'foxy_quantity',
            'foxy_mrr',
            'foxy_tcv',
            'foxy_comprate',
            'foxy_wonserviceid',
            'foxy_serviceid',
            'foxy_sololine',
            'statecode',
            'foxy_upselltype',
            'foxy_renewaloverridereason',
            'foxy_revenuetype',
            'foxy_linemargin',
            'foxy_contractend',
            'foxy_term',
            'foxy_inpaymentstatus',
            'foxy_mrruptick',
            'foxy_totalinpayments',
            'foxy_renewaleligible',
            'foxy_expectedcomp',
            'foxyflow_claimnotes',
            'crc9f_claimid'
        ];

        // Build the URL with optional filter
        let apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices?$select=${selectFields.join(',')}&$expand=foxy_Product($select=name),foxy_Account($select=name),foxy_Opportunity($select=name,foxy_sfdcoppid,actualclosedate,actualvalue),foxy_AccountLocation($expand=foxy_Building($select=foxy_fulladdress))`;
        
        if (filter) {
            apiUrl += `&$filter=${filter}`;
        }

        context.log(`🟦 Making Dataverse request to: ${apiUrl}`);
        const response = await axios.get(apiUrl, { headers });
        context.log(`🟦 Dataverse response status: ${response.status}`);
        context.log(`🟦 Records returned: ${response.data.value?.length || 0}`);
        context.log(`🟦 Sample record disposition: ${response.data.value?.[0]?.foxy_renewaldisposition}`);

        return { 
            ...corsResponse,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('🔴 Error in listRevenueServices:', error);
        if (axios.isAxiosError(error)) {
            context.error('🔴 Dataverse error response:', error.response?.data);
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

app.http('listRevenueServices', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listRevenueServices
});
