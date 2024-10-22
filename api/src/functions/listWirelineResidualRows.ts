import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listWirelineResidualRows(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    try {
        const companyId = request.query.get('companyId');

        if (!companyId) {
            return {
                ...corsResponse,
                status: 400,
                body: "Company ID is required"
            };
        }

        const accessToken = await getAccessToken();
        // Format the GUID properly for Dataverse OData query
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxyflow_residualservices?$filter=_foxyflow_company_value eq ${companyId}`;

        const response = await axios.get(apiUrl, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Prefer": "odata.include-annotations=*"
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
        context.log(`Error retrieving wireline residual rows: ${error.message}`);
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
