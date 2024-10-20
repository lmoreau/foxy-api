import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { ClientSecretCredential } from "@azure/identity";

// Environment variables
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const dataverseUrl = process.env.DATAVERSE_URL;

// Create a credential using Azure AD app registration
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

/**
 * Get an access token for Dataverse API
 * @returns {Promise<string>} The access token
 */
async function getAccessToken(): Promise<string> {
    const scope = `${dataverseUrl}/.default`;
    const token = await credential.getToken(scope);
    return token.token;
}

/**
 * Azure Function to get an opportunity by ID from Dataverse
 */
export async function getOpportunityById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const id = request.query.get('id') || await request.text();
    if (!id) {
        return { status: 400, body: "Please provide a GUID for the opportunity" };
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.2/opportunities(${id})`;

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
        context.log(`Error retrieving opportunity: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            status, 
            body: `Error retrieving opportunity: ${message}` 
        };
    }
}

// Register the HTTP trigger
app.http('getOpportunityById', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: getOpportunityById
});
