import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listRogersWirelineRecords(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    try {
        const accountId = request.query.get('accountId');

        if (!accountId) {
            return {
                ...corsResponse,
                status: 400,
                body: "Account ID is required"
            };
        }

        const accessToken = await getAccessToken();
        // Query for foxy_ROGERSWireline records where foxy_Account lookup matches the accountId
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_rogerswirelines?$filter=_foxy_account_value eq ${accountId}`;

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
        context.log(`Error retrieving Rogers Wireline records: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return {
            ...corsResponse,
            status,
            body: `Error retrieving Rogers Wireline records: ${message}`
        };
    }
}

app.http('listRogersWirelineRecords', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listRogersWirelineRecords
});
