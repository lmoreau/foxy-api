import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listQuoteRequests(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    const userToken = request.headers.get('authorization');
    if (!userToken) {
        return {
            ...corsResponse,
            status: 401,
            body: "Authorization header is required"
        };
    }

    try {
        const accessToken = userToken.replace('Bearer ', '');

        // Get stages filter from query params
        const stagesFilter = request.query.get('stages');

        // Build the URL with filter and expand
        const expand = '$expand=foxy_Account($select=name),foxy_Opportunity($select=name)';
        const filterQuery = stagesFilter ? `$filter=${stagesFilter}` : '';
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequests?${filterQuery}${filterQuery ? '&' : ''}${expand}`;

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
        context.log(`Error retrieving quote requests: ${error}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return {
            ...corsResponse,
            status,
            body: `Error retrieving quote requests: ${message}`
        };
    }
}

app.http('listQuoteRequests', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listQuoteRequests
});
