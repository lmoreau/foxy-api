import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

interface CreatePostRequest {
    regardingobjectid: string;
    text: string;
}

export async function createPost(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const requestBody = await request.json() as CreatePostRequest;
        if (!requestBody) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide request body" 
            };
        }

        // Log the request body
        context.log('Request body:', JSON.stringify(requestBody));

        // Convert the request body to use OData bindings for relationships
        const modifiedRequestBody: any = {
            ...requestBody
        };

        // Handle OData bindings for relationships
        if (requestBody.regardingobjectid) {
            modifiedRequestBody["regardingobjectid_foxy_foxyquoterequest@odata.bind"] = 
                `/foxy_foxyquoterequests(${requestBody.regardingobjectid})`;
            delete modifiedRequestBody.regardingobjectid;
        }

        // Log the modified request body
        context.log('Modified request body:', JSON.stringify(modifiedRequestBody));

        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/posts`;

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
    } catch (error: unknown) {
        context.log(`Error creating post: ${error}`);
        if (axios.isAxiosError(error)) {
            context.log('Error response status:', error.response?.status);
            context.log('Error response data:', JSON.stringify(error.response?.data));
        }
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) 
            ? error.response?.data?.error?.message || error.message 
            : error instanceof Error ? error.message : String(error);
        return { 
            ...corsResponse,
            status, 
            body: `Error creating post: ${message}`
        };
    }
}

app.http('createPost', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: createPost
});
