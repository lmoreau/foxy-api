import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

interface UpdateRenewalDispositionRequest {
    id: string;
    foxy_renewaldisposition: number;
}

export async function updateRenewalDisposition(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        return { 
            ...corsResponse,
            status: 401, 
            body: "Authorization header is required"
        };
    }

    try {
        const requestBody = await request.json() as UpdateRenewalDispositionRequest;
        context.log(`🟦 Received request body: ${JSON.stringify(requestBody, null, 2)}`);
        
        if (!requestBody.id) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide id in the request body"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        const formattedId = requestBody.id.replace(/[{}]/g, '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices(${formattedId})`;

        const updateData: any = {
            foxy_renewaldisposition: requestBody.foxy_renewaldisposition
        };

        context.log(`🟦 Making Dataverse request to: ${apiUrl}`);
        context.log(`🟦 Update data: ${JSON.stringify(updateData, null, 2)}`);
        
        try {
            const response = await axios.patch(apiUrl, updateData, { 
                headers,
                validateStatus: null
            });
            
            context.log(`🟦 Dataverse response status: ${response.status}`);
            context.log(`🟦 Dataverse response data: ${JSON.stringify(response.data, null, 2)}`);

            if (response.status !== 200 && response.status !== 204) {
                throw new Error(`Dataverse returned unexpected status: ${response.status}`);
            }

            return { 
                ...corsResponse,
                status: 200,
                body: JSON.stringify({ message: "Successfully updated renewal disposition" }),
                headers: { 
                    "Content-Type": "application/json",
                    ...corsResponse?.headers
                }
            };
        } catch (dataverseError) {
            context.log(`🔴 Dataverse request failed: ${dataverseError}`);
            if (axios.isAxiosError(dataverseError)) {
                context.log(`🔴 Dataverse error response: ${JSON.stringify(dataverseError.response?.data, null, 2)}`);
            }
            throw dataverseError;
        }
    } catch (error) {
        context.log(`🔴 Function error: ${error}`);
        if (axios.isAxiosError(error)) {
            context.log(`🔴 Full error response: ${JSON.stringify(error.response?.data, null, 2)}`);
            return {
                ...corsResponse,
                status: error.response?.status || 500,
                body: JSON.stringify({
                    error: error.response?.data?.error?.message || error.message
                })
            };
        }
        
        return { 
            ...corsResponse,
            status: 500, 
            body: JSON.stringify({
                error: (error as Error).message
            })
        };
    }
}

app.http('updateRenewalDisposition', {
    methods: ['PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: updateRenewalDisposition
}); 