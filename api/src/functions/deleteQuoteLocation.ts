import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";

interface DeleteQuoteLocationRequest {
    deleteId: string;
}

/**
 * Azure Function to delete a quote location by ID from Dataverse
 */
export async function deleteQuoteLocation(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const requestBody = await request.json() as DeleteQuoteLocationRequest;
    const deleteId = requestBody.deleteId;

    if (!deleteId) {
        return { status: 400, body: JSON.stringify({ error: "Please provide a GUID for the quote location to delete" }) };
    }

    try {
        context.log(`Attempting to delete quote location with ID: ${deleteId}`);
        const startTime = Date.now();

        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_foxyquoterequestlocations(${deleteId})`;

        await axios.delete(apiUrl, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0"
            }
        });

        const endTime = Date.now();
        context.log(`Quote location deleted successfully. Time taken: ${endTime - startTime}ms`);

        return { 
            status: 204
        };
    } catch (error) {
        context.log(`Error deleting quote location: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            status,
            body: JSON.stringify({ error: `Error deleting quote location: ${message}` })
        };
    }
}

// Register the HTTP trigger
app.http('deleteQuoteLocation', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    handler: deleteQuoteLocation
});
