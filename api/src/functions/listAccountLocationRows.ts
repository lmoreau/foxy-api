import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listAccountLocationRows(request: HttpRequest, context: InvocationContext, accountId: string): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_accountlocations?$filter=_foxy_account_value eq '${accountId}'&$expand=foxy_Building`;        const query = apiUrl;

        context.log('API query:', query);

        const response = await axios.get(query, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            }
        });

        context.log('API response:', JSON.stringify(response.data, null, 2));

        return {
            ...corsResponse,
            body: JSON.stringify(response.data),
            headers: {
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.log(`Error retrieving account locations: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return {
            ...corsResponse,
            status,
            body: `Error retrieving account locations: ${message}`
        };
    }
}

app.http('listAccountLocationRows', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
        let accountId = request.query.get('accountId');
        if (!accountId && request.body) {
            const requestBody = await request.text();
            const parsedBody = JSON.parse(requestBody);
            accountId = parsedBody.accountId;
        }
        if (!accountId) {
            return {
                status: 400,
                body: "Please pass an accountId on the query string or in the request body"
            };
        }
        return await listAccountLocationRows(request, context, accountId);
    }
});
