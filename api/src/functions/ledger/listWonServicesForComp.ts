import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function listWonServicesForComp(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const searchParams = new URL(request.url).searchParams;
        const sfdcOppID = searchParams.get('sfdcOppID');

        if (!sfdcOppID) {
            return {
                ...corsResponse,
                status: 400,
                body: "sfdcOppID parameter is required"
            };
        }

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
            'foxy_expectedcomp',
            'foxy_totalinpayments'
        ];

        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices?$select=${selectFields.join(',')}&$expand=foxy_Product($select=name),foxy_Account($select=name),foxy_Opportunity($select=name,foxy_sfdcoppid,actualclosedate,actualvalue),foxy_AccountLocation($expand=foxy_Building($select=foxy_fulladdress))&$filter=foxy_Opportunity/foxy_sfdcoppid eq '${sfdcOppID}'`;

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
        context.error('Error in listWonServicesForComp:', error);
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

app.http('listWonServicesForComp', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listWonServicesForComp
});
