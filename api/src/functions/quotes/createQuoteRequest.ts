import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

interface QuoteRequestBody {
    _foxy_account_value?: string;
    _foxy_opportunity_value?: string;
    [key: string]: any;
}

export async function createQuoteRequest(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    try {
        const requestBody = await request.json();
        const body = requestBody as QuoteRequestBody;
        
        // Validate required fields
        if (!body._foxy_account_value || !body._foxy_opportunity_value) {
            return {
                ...corsResponse,
                status: 400,
                body: JSON.stringify({
                    error: "Account and Opportunity IDs are required"
                }),
                headers: { 
                    "Content-Type": "application/json",
                    ...corsResponse?.headers
                }
            };
        }

        // Log the request body
        context.log('Request body:', JSON.stringify(body));

        // Transform the request body to use OData binding format
        const modifiedRequestBody = {
            ...body,
            ...(body._foxy_account_value && {
                "foxy_Account@odata.bind": `/accounts(${body._foxy_account_value})`
            }),
            ...(body._foxy_opportunity_value && {
                "foxy_Opportunity@odata.bind": `/opportunities(${body._foxy_opportunity_value})`
            })
        } as Record<string, any>;

        // Remove the original properties
        if ('_foxy_account_value' in modifiedRequestBody) {
            delete modifiedRequestBody._foxy_account_value;
        }
        if ('_foxy_opportunity_value' in modifiedRequestBody) {
            delete modifiedRequestBody._foxy_opportunity_value;
        }

        // Log the modified request body
        context.log('Modified request body:', JSON.stringify(modifiedRequestBody));

        // Use the user's token directly
        const userToken = request.headers.get('authorization');
        if (!userToken) {
            return { 
                ...corsResponse,
                status: 401, 
                body: "Authorization header is required"
            };
        }
        const accessToken = userToken.replace('Bearer ', '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequests`;

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
        context.log(`Error creating quote request: ${error}`);
        if (axios.isAxiosError(error)) {
            context.log('Error response status:', error.response?.status);
            context.log('Error response data:', JSON.stringify(error.response?.data));
        }
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) 
            ? error.response?.data?.error?.message || (error as Error).message 
            : (error as Error).message || 'An unknown error occurred';
        return { 
            ...corsResponse,
            status, 
            body: `Error creating quote request: ${message}`
        };
    }
}

app.http('createQuoteRequest', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: createQuoteRequest
});
