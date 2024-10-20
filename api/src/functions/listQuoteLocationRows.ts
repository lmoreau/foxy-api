import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";

interface RequestBody {
    id?: string;
}

/**
 * Azure Function to list quote locations for a specific quote request from Dataverse
 */
export async function listQuoteLocationRows(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    let id: string | undefined;

    // Check query parameters
    id = request.query.get('id');

    // If not in query, check request body
    if (!id) {
        const body: RequestBody = await request.json().catch(() => ({}));
        id = body.id;
    }

    if (!id) {
        return { 
            status: 400, 
            body: JSON.stringify({
                error: "Missing id",
                message: "Please provide a GUID for the quote request in the query parameters or request body",
                example: {
                    queryParam: "?id=your-guid-here",
                    requestBody: { id: "your-guid-here" }
                }
            }),
            headers: { "Content-Type": "application/json" }
        };
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequestlocations`;
        const filter = `?$filter=_foxy_foxyquoterequest_value eq ${id}`;

        const response = await axios.get(`${apiUrl}${filter}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            }
        });

        return { 
            body: JSON.stringify(response.data), 
            headers: { "Content-Type": "application/json" } 
        };
    } catch (error) {
        context.log(`Error retrieving quote locations: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            status, 
            body: JSON.stringify({
                error: "Failed to retrieve quote locations",
                message: message,
                details: axios.isAxiosError(error) ? error.response?.data : undefined
            }),
            headers: { "Content-Type": "application/json" }
        };
    }
}

// Register the HTTP trigger
app.http('listQuoteLocationRows', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: listQuoteLocationRows
});
