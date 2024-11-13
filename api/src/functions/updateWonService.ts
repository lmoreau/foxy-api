import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

interface UpdateWonServiceRequest {
    id: string;
    foxy_expectedcomp?: number;
    crc9f_expectedcompbreakdown?: string;
    foxy_inpaymentstatus?: number;
    foxyflow_internalnotes?: string | null;
    foxyflow_claimnotes?: string;
    crc9f_claimid?: string;
}

export async function updateWonService(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const requestBody = await request.json() as UpdateWonServiceRequest;
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

        const updateData: any = {};

        if (requestBody.crc9f_claimid !== undefined) {
            context.log(`🟦 Adding claim ID to update: ${requestBody.crc9f_claimid}`);
            updateData.crc9f_claimid = requestBody.crc9f_claimid;
        }

        if (requestBody.foxy_inpaymentstatus !== undefined) {
            context.log(`🟦 Adding payment status to update: ${requestBody.foxy_inpaymentstatus}`);
            updateData.foxy_inpaymentstatus = requestBody.foxy_inpaymentstatus;
        }

        if (requestBody.foxyflow_internalnotes !== undefined) {
            context.log(`🟦 Adding internal notes to update: ${requestBody.foxyflow_internalnotes}`);
            updateData.foxyflow_internalnotes = requestBody.foxyflow_internalnotes;
        }

        if (requestBody.foxyflow_claimnotes !== undefined) {
            context.log(`🟦 Adding claim notes to update: ${requestBody.foxyflow_claimnotes}`);
            updateData.foxyflow_claimnotes = requestBody.foxyflow_claimnotes;
        }

        context.log(`🟦 Making Dataverse request to: ${apiUrl}`);
        context.log(`🟦 Update data: ${JSON.stringify(updateData, null, 2)}`);
        
        try {
            const response = await axios.patch(apiUrl, updateData, { 
                headers,
                validateStatus: null // This will prevent axios from throwing on any status code
            });
            
            context.log(`🟦 Dataverse response status: ${response.status}`);
            context.log(`🟦 Dataverse response data: ${JSON.stringify(response.data, null, 2)}`);

            if (response.status !== 200 && response.status !== 204) {
                throw new Error(`Dataverse returned unexpected status: ${response.status}`);
            }

            return { 
                ...corsResponse,
                status: 200,
                body: JSON.stringify({ message: "Successfully updated won service" }),
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

app.http('updateWonService', {
    methods: ['PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: updateWonService
});
