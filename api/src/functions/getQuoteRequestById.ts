import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function getQuoteRequestById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const startTime = Date.now();
    context.log(`[Performance] Starting getQuoteRequestById execution at ${new Date().toISOString()}`);

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

    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get('id');
    if (!id) {
        return { 
            ...corsResponse,
            status: 400, 
            body: "Please provide a GUID for the quote request" 
        };
    }

    try {
        const formattedId = id.replace(/[{}]/g, '');
        const headers = getDataverseHeaders(authHeader);
        const apiUrl = `${dataverseUrl}/api/data/v9.2/foxy_foxyquoterequests(${formattedId})?$expand=foxy_Account($select=name,foxy_duns,foxy_basecustomer),owninguser($select=fullname),foxy_Opportunity($select=foxy_opportunitytype,estimatedclosedate,foxy_sfdcoppid,name)`;

        context.log(`[Performance] Starting Dynamics CRM request at ${new Date().toISOString()} (${Date.now() - startTime}ms elapsed)`);
        context.log(`[Debug] Requesting URL: ${apiUrl}`);

        const dynamicsStartTime = Date.now();
        const response = await axios.get(apiUrl, { 
            headers,
            timeout: 30000 // 30 second timeout
        });
        const dynamicsDuration = Date.now() - dynamicsStartTime;

        context.log(`[Performance] Dynamics CRM request completed in ${dynamicsDuration}ms`);
        context.log(`[Performance] Response size: ${JSON.stringify(response.data).length} bytes`);

        const result = { 
            ...corsResponse,
            body: JSON.stringify(response.data),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };

        const totalDuration = Date.now() - startTime;
        context.log(`[Performance] Total execution time: ${totalDuration}ms`);
        context.log(`[Performance] Breakdown:
            - Pre-request setup: ${dynamicsStartTime - startTime}ms
            - Dynamics CRM request: ${dynamicsDuration}ms
            - Response processing: ${Date.now() - (dynamicsStartTime + dynamicsDuration)}ms
        `);

        return result;
    } catch (error) {
        const errorTime = Date.now();
        context.error('Error in getQuoteRequestById:', error);
        if (axios.isAxiosError(error)) {
            context.log('Axios error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                duration: `${errorTime - startTime}ms`,
                code: error.code,
                message: error.message
            });
            return {
                ...corsResponse,
                status: error.response?.status || 500,
                body: JSON.stringify({
                    error: error.response?.data?.error?.message || error.message,
                    duration: `${errorTime - startTime}ms`
                })
            };
        }
        
        return { 
            ...corsResponse,
            status: 500, 
            body: JSON.stringify({
                error: (error as Error).message,
                duration: `${errorTime - startTime}ms`
            })
        };
    }
}

app.http('getQuoteRequestById', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: getQuoteRequestById
});
