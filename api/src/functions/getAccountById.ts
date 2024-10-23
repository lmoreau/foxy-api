import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";

/**
 * Azure Function to get an account by ID from Dataverse
 */
export async function getAccountById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.query.get('id') || await request.text();
    if (!id) {
        return { status: 400, body: "Please provide a GUID for the account" };
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.2/accounts(${id})`;

        const response = await axios.get(apiUrl, {
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
        context.log(`Error retrieving account: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return {
            status,
            body: `Error retrieving account: ${message}`
        };
    }
}

// Register the HTTP trigger
app.http('getAccountById', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: getAccountById
});
