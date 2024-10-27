import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

interface UpdateWirelineResidualRequest {
    foxyflow_wirelineresiduals: string;
}

export async function updateAccountWirelineResiduals(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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

    const accountId = request.query.get('accountId');
    if (!accountId) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide an accountId"
        };
    }

    try {
        const requestBody = await request.json() as UpdateWirelineResidualRequest;
        if (!requestBody.foxyflow_wirelineresiduals) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide foxyflow_wirelineresiduals in the request body"
            };
        }

        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        const formattedAccountId = accountId.replace(/[{}]/g, '');
        const apiUrl = `${dataverseUrl}/api/data/v9.1/accounts(${formattedAccountId})`;

        await axios.patch(apiUrl, {
            foxyflow_wirelineresiduals: requestBody.foxyflow_wirelineresiduals,
            crc9f_residuallastscrub: new Date().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'Prefer': 'return=representation'
            }
        });

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ message: "Successfully updated wireline residuals" }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.log(`Error updating wireline residuals: ${error}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            ...corsResponse,
            status, 
            body: `Error updating wireline residuals: ${message}`
        };
    }
}

app.http('updateAccountWirelineResiduals', {
    methods: ['PATCH', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: updateAccountWirelineResiduals
});
