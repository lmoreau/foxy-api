import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listWirelineResidualRows(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    // Get authorization header from request
    const userToken = request.headers.get('authorization');
    if (!userToken) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    const companyId = request.query.get('companyId');
    if (!companyId) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide a companyId" 
        };
    }

    try {
        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        // Format the GUID properly for Dataverse OData query
        const formattedCompanyId = companyId.replace(/[{}]/g, '');
        const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_rogerswirelines?$filter=_foxy_account_value eq '${formattedCompanyId}'`;

        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'Prefer': 'return=representation'
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
        context.log(`Error retrieving wireline residual rows: ${error}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving wireline residual rows: ${message}`
        };
    }
}

app.http('listWirelineResidualRows', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listWirelineResidualRows
});
