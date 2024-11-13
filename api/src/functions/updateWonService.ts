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
        context.log('Received request body:', requestBody);
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

        if (requestBody.foxy_expectedcomp !== undefined) {
            updateData.foxy_expectedcomp = requestBody.foxy_expectedcomp;
        }

        if (requestBody.crc9f_expectedcompbreakdown !== undefined) {
            updateData.crc9f_expectedcompbreakdown = requestBody.crc9f_expectedcompbreakdown;
        }

        if (requestBody.foxy_inpaymentstatus !== undefined) {
            updateData.foxy_inpaymentstatus = requestBody.foxy_inpaymentstatus;
        }

        if (requestBody.foxyflow_internalnotes !== undefined) {
            updateData.foxyflow_internalnotes = requestBody.foxyflow_internalnotes;
        }

        if (requestBody.foxyflow_claimnotes !== undefined) {
            updateData.foxyflow_claimnotes = requestBody.foxyflow_claimnotes;
        }

        context.log('Sending update data to Dataverse:', updateData);
        await axios.patch(apiUrl, updateData, { headers });
        context.log('Dataverse response received');

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ message: "Successfully updated won service" }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Full error details:', error);
        if (axios.isAxiosError(error)) {
            context.log('Full Axios error response:', error.response);
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
