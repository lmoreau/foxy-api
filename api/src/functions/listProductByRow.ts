import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function listProductByRow(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const accessToken = userToken.replace('Bearer ', '');
        
        // Get filter from query params, default to no filter if none provided
        const filter = request.query.get('$filter') || '';
        
        // Construct the URL with the filter if provided, including all required fields
        const apiUrl = `${dataverseUrl}/api/data/v9.2/products?$select=productid,name,foxy_category,foxy_subcategory,description&$orderby=name&$top=5000${
            filter ? `&$filter=${filter}` : ''
        }`;

        const response = await axios.get(apiUrl, {
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
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error: unknown) {
        context.log(`Error retrieving products:`, error);
        
        let status = 500;
        let message = 'An unknown error occurred';
        
        if (axios.isAxiosError(error)) {
            context.log('Error response status:', error.response?.status);
            context.log('Error response data:', JSON.stringify(error.response?.data));
            status = error.response?.status || 500;
            message = error.response?.data?.error?.message || error.message;
        } else if (error instanceof Error) {
            message = error.message;
        }
        
        return { 
            ...corsResponse,
            status, 
            body: `Error retrieving products: ${message}`
        };
    }
}

app.http('listProductByRow', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listProductByRow
});
