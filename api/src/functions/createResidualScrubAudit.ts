import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

interface ResidualScrubAuditBody {
    accountId: string;
    note?: string;
    status: string | number;  // Accept both string and number
}

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
        const requestBody = await request.json() as ResidualScrubAuditBody;
        if (!requestBody) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide request body" 
            };
        }

        if (!requestBody.accountId) {
            return {
                ...corsResponse,
                status: 400,
                body: "accountId is required in the request body"
            };
        }

        if (requestBody.status === undefined) {
            return {
                ...corsResponse,
                status: 400,
                body: "status is required in the request body"
            };
        }

        // Convert status to string for validation
        const statusString = requestBody.status.toString();
        
        // Validate status is a 9-digit number
        const statusRegex = /^\d{9}$/;
        if (!statusRegex.test(statusString)) {
            return {
                ...corsResponse,
                status: 400,
                body: "Invalid status value. Must be a 9-digit number"
            };
        }

        // Log the request body
        context.log('Request body:', JSON.stringify(requestBody));

        // Create the request body for crc9f_residualscrubaudit
        const modifiedRequestBody = {
            "crc9f_Account@odata.bind": `/accounts(${requestBody.accountId})`,
            "crc9f_note": requestBody.note || "",
            "crc9f_updatedon": new Date().toISOString(),
            "crc9f_newstatus": parseInt(statusString)  // Convert to number for Dataverse
        };

        // Log the modified request body
        context.log('Modified request body:', JSON.stringify(modifiedRequestBody));

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

        const response = await axios.post(apiUrl, modifiedRequestBody, {
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
