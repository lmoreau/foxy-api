import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

interface QuoteLineItemBody {
    // Required fields with OData bindings
    _foxy_foxyquoterequestlocation_value: string;
    _foxy_product_value: string;
    // Optional fields
    foxy_quantity?: number;
    foxy_each?: number;
    foxy_mrr?: number;
    foxy_linetcv?: number;
    foxy_term?: number;
    foxy_revenuetype?: number;
    foxy_renewaltype?: string;
    foxy_renewaldate?: string;
    foxy_existingqty?: number;
    foxy_existingmrr?: number;
    [key: string]: any; // Allow for additional fields
}

const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 30000; // 30 seconds

async function attemptDataverseRequest(
    url: string, 
    data: any, 
    headers: any, 
    context: InvocationContext, 
    attempt: number = 1
): Promise<any> {
    try {
        context.log(`Attempt ${attempt} to create line item`);
        const response = await axios.post(url, data, {
            headers,
            timeout: INITIAL_TIMEOUT * attempt // Increase timeout with each retry
        });
        context.log(`Attempt ${attempt} successful`);
        return response;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            context.log(`Attempt ${attempt} failed:`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                code: error.code,
                message: error.message
            });

            // If it's a timeout or network error and we haven't exceeded retries
            if ((error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.message.includes('socket hang up')) 
                && attempt < MAX_RETRIES) {
                context.log(`Retrying after failure (${error.message})`);
                // Wait before retrying, with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                return attemptDataverseRequest(url, data, headers, context, attempt + 1);
            }
        }
        throw error;
    }
}

export async function createQuoteLineItem(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const requestBody = await request.json() as QuoteLineItemBody;
        if (!requestBody) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide request body" 
            };
        }

        // Validate required fields
        if (!requestBody._foxy_foxyquoterequestlocation_value || !requestBody._foxy_product_value) {
            return {
                ...corsResponse,
                status: 400,
                body: "Location and Product IDs are required"
            };
        }

        // Log the request body
        context.log('Request body:', JSON.stringify(requestBody));

        // Convert the request body to use OData bindings for relationships
        const modifiedRequestBody: any = {
            ...requestBody
        };

        // Handle OData bindings for relationships
        if (requestBody._foxy_foxyquoterequestlocation_value) {
            modifiedRequestBody["foxy_FoxyQuoteLocation@odata.bind"] = 
                `/foxy_foxyquoterequestlocations(${requestBody._foxy_foxyquoterequestlocation_value})`;
            delete modifiedRequestBody._foxy_foxyquoterequestlocation_value;
        }

        if (requestBody._foxy_product_value) {
            modifiedRequestBody["foxy_Product@odata.bind"] = 
                `/products(${requestBody._foxy_product_value})`;
            delete modifiedRequestBody._foxy_product_value;
        }

        // Log the modified request body
        context.log('Modified request body:', JSON.stringify(modifiedRequestBody));

        // Use the user's token directly
        const accessToken = userToken.replace('Bearer ', '');
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequestlineitems`;

        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            'Prefer': 'return=representation'
        };

        // Attempt the request with retry logic
        const response = await attemptDataverseRequest(apiUrl, modifiedRequestBody, headers, context);

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
        context.log(`Error creating quote line item: ${error}`);
        if (axios.isAxiosError(error)) {
            context.log('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                code: error.code,
                message: error.message
            });
        }
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) 
            ? error.response?.data?.error?.message || error.message 
            : error instanceof Error ? error.message : String(error);
        return { 
            ...corsResponse,
            status, 
            body: JSON.stringify({
                error: `Error creating quote line item: ${message}`,
                details: axios.isAxiosError(error) ? error.response?.data : null
            }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    }
}

app.http('createQuoteLineItem', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: createQuoteLineItem
});
