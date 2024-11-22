import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

export async function listPosts(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const searchParams = new URL(request.url).searchParams;
        const id = searchParams.get('regardingobjectid');

        if (!id) {
            return {
                ...corsResponse,
                status: 400,
                body: "regardingobjectid parameter is required"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        const apiUrl = `${dataverseUrl}/api/data/v9.2/posts?$select=postid,text,largetext,createdon,modifiedon&$expand=createdby($select=fullname,systemuserid)&$filter=_regardingobjectid_value eq '${id}'`;

        const response = await axios.get(apiUrl, { headers });

        return { 
            ...corsResponse,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in listPosts:', error);
        if (axios.isAxiosError(error)) {
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

app.http('listPosts', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listPosts
});
