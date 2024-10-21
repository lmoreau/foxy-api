import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

interface RequestBody {
    buildingId: string;
    quoteRequestId: string;
    accountLocationId: string;
}

export async function createFoxyQuoteRequestLocation(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    try {
        const requestBody = await request.json() as RequestBody;
        const { buildingId, quoteRequestId, accountLocationId } = requestBody;

        if (!buildingId || !quoteRequestId || !accountLocationId) {
            return {
                status: 400,
                body: "Please provide buildingId, quoteRequestId, and accountLocationId in the request body"
            };
        }

        const accessToken = await getAccessToken();
        const url = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequestlocations`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                "foxy_Building@odata.bind": `/foxy_buildings(${buildingId})`,
                "foxy_FoxyQuoteRequest@odata.bind": `/foxy_foxyquoterequests(${quoteRequestId})`,
                "foxy_CompanyLocation@odata.bind": `/foxy_accountlocations(${accountLocationId})`
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        }

        const result = await response.json();

        return {
            ...corsResponse,
            status: 200,
            body: JSON.stringify(result),
            headers: {
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error creating Foxy Quote Request Location:', error);
        return {
            ...corsResponse,
            status: 500,
            body: JSON.stringify({
                message: "An error occurred while creating the Foxy Quote Request Location",
                error: error instanceof Error ? error.message : String(error)
            }),
            headers: {
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    }
}

app.http('createFoxyQuoteRequestLocation', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: createFoxyQuoteRequestLocation
});
