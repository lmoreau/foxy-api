import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function getQuoteRequestById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    const id = request.query.get('id') || await request.text();
    if (!id) {
        return { status: 400, body: "Please provide a GUID for the quote request" };
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_foxyquoterequests?$filter=foxy_foxyquoterequestid eq ${id}&$expand=foxy_Account`;

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
        context.log(`Error retrieving quote request: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving quote request: ${message}`
        };
    }
}

app.http('getQuoteRequestById', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: getQuoteRequestById
});
