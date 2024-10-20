import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";

/**
 * Azure Function to list all products from Dataverse
 */
export async function listProductByRow(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.2/products`;

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
        context.log(`Error retrieving products: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            status, 
            body: JSON.stringify({
                error: "Failed to retrieve products",
                message: message,
                details: axios.isAxiosError(error) ? error.response?.data : undefined
            }),
            headers: { "Content-Type": "application/json" }
        };
    }
}

// Register the HTTP trigger
app.http('listProductByRow', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: listProductByRow
});
