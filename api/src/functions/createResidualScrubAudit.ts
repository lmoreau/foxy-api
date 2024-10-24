import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function createCrc9fResidualScrubAudit(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    // Get authorization header from request
    const userToken = request.headers.get('authorization');
    if (!userToken) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    try {
        // Hardcoded accountId for testing
        const accountId = "897f2922-2a1a-ec11-b6e7-000d3ae9b93f";

        // Create the request body for crc9f_residualscrubaudit
        const requestBody = {
            "crc9f_Account@odata.bind": `/accounts(${accountId})`
        };

        // Log the request body
        context.log('Request body:', JSON.stringify(requestBody));

        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/crc9f_residualscrubaudits`;

        // Log the API URL and headers
        context.log('API URL:', apiUrl);
        context.log('Headers:', {
            'Authorization': 'Bearer [REDACTED]',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            'Prefer': 'return=representation'
        });

        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'Prefer': 'return=representation'
            }
        });

        // Log the response
        context.log('Response status:', response.status);
        context.log('Response data:', JSON.stringify(response.data));

        return { 
            ...corsResponse,
            status: 201,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.log(`Error creating residual scrub audit: ${error}`);
        if (axios.isAxiosError(error)) {
            context.log('Error response status:', error.response?.status);
            context.log('Error response data:', JSON.stringify(error.response?.data));
        }
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            ...corsResponse,
            status, 
            body: `Error creating residual scrub audit: ${message}`
        };
    }
}

app.http('createCrc9fResidualScrubAudit', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: createCrc9fResidualScrubAudit
});
