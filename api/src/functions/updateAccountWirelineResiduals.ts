import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

interface UpdateRequest {
    foxyflow_wirelineresiduals: string;
}

export async function updateAccountWirelineResiduals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    try {
        const accountId = request.query.get('accountId');
        const body = await request.json() as UpdateRequest;
        const { foxyflow_wirelineresiduals } = body;

        if (!accountId || foxyflow_wirelineresiduals === undefined) {
            return {
                ...corsResponse,
                status: 400,
                body: "Account ID and wireline residuals value are required"
            };
        }

        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.2/accounts(${accountId})`;

        await axios.patch(apiUrl, 
            { foxyflow_wirelineresiduals },
            {
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                    "If-Match": "*"
                }
            }
        );

        return {
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ success: true }),
            headers: {
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.log(`Error updating account wireline residuals: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return {
            ...corsResponse,
            status,
            body: `Error updating account wireline residuals: ${message}`
        };
    }
}

app.http('updateAccountWirelineResiduals', {
    methods: ['PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: updateAccountWirelineResiduals
});
