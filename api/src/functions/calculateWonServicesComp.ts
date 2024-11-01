import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

interface CalculateCompRequest {
    ids: string[];
}

interface WonService {
    foxy_revenuetype: number;
    foxy_renewaltype: string;
    foxy_mrruptick: number | null;
    foxy_tcv: number;
    foxy_linemargin: number;
    foxy_term: number;
    foxy_mrr: number;
}

function getCommissionRate(marginPercent: number): number {
    if (marginPercent < 5) return 0;
    if (marginPercent < 15) return 0.06;
    if (marginPercent < 30) return 0.10;
    if (marginPercent < 50) return 0.14;
    if (marginPercent < 60) return 0.20;
    return 0.22;
}

function calculateExpectedComp(service: WonService, context: InvocationContext): number {
    context.log('Calculating for service:', {
        revenuetype: service.foxy_revenuetype,
        renewaltype: service.foxy_renewaltype,
        mrruptick: service.foxy_mrruptick,
        tcv: service.foxy_tcv,
        linemargin: service.foxy_linemargin,
        term: service.foxy_term,
        mrr: service.foxy_mrr
    });

    // Convert margin to percentage for calculations
    const marginPercent = service.foxy_linemargin * 100;
    context.log('Line margin (%):', marginPercent);

    // Handle UPSELL or RENEWAL with positive MRR uptick
    if ((service.foxy_revenuetype === 612100002 || service.foxy_revenuetype === 612100003) && 
        service.foxy_mrruptick && service.foxy_mrruptick > 0) {
        
        context.log('Processing Upsell/Renewal with positive MRR uptick');

        // Only proceed with split calculation if it's not an Early Renewal for Renewals
        if (service.foxy_revenuetype === 612100003 && service.foxy_renewaltype === "Early Renewal") {
            context.log('Early Renewal detected, returning 0');
            return 0;
        }

        // Calculate existing MRR (total MRR - uptick)
        const existingMRR = service.foxy_mrr - service.foxy_mrruptick;
        context.log('Existing MRR:', existingMRR);

        // Calculate TCVs
        const existingTCV = existingMRR * service.foxy_term;
        const newTCV = service.foxy_mrruptick * service.foxy_term;
        context.log('Existing TCV:', existingTCV);
        context.log('New TCV:', newTCV);

        // Calculate compensation for existing TCV (5%)
        const existingComp = existingTCV * 0.05;
        context.log('Existing TCV compensation:', existingComp);

        // Calculate compensation for new TCV (based on margin)
        const rate = getCommissionRate(marginPercent);
        const newComp = newTCV * rate;
        context.log('New TCV compensation:', newComp, 'using rate:', rate);

        const totalComp = existingComp + newComp;
        context.log('Total compensation:', totalComp);
        return totalComp;
    }

    // Regular Renewal (including negative uptick cases)
    if (service.foxy_revenuetype === 612100003) {
        context.log('Processing Regular Renewal');
        if (service.foxy_renewaltype !== "Early Renewal") {
            const comp = service.foxy_tcv * 0.05;
            context.log('Renewal compensation calculated:', comp);
            return comp;
        }
        context.log('Early Renewal detected, returning 0');
        return 0;
    }

    // Regular New/Net New
    if (service.foxy_revenuetype === 612100000 || service.foxy_revenuetype === 612100001) {
        context.log('Processing New/Net New');
        const rate = getCommissionRate(marginPercent);
        context.log('Selected rate:', rate);
        const comp = service.foxy_tcv * rate;
        context.log('New/Net New compensation calculated:', comp);
        return comp;
    }

    context.log('No matching rules, returning 0');
    return 0;
}

export async function calculateWonServicesComp(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
        const requestBody = await request.json() as CalculateCompRequest;
        if (!requestBody.ids || !Array.isArray(requestBody.ids) || requestBody.ids.length === 0) {
            return { 
                ...corsResponse,
                status: 400, 
                body: "Please provide an array of won service IDs in the request body"
            };
        }

        const headers = getDataverseHeaders(authHeader);
        const results = [];

        // Process each won service
        for (const id of requestBody.ids) {
            const formattedId = id.replace(/[{}]/g, '');
            
            // First get the current service data
            const getUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices(${formattedId})?$select=foxy_revenuetype,foxy_renewaltype,foxy_mrruptick,foxy_tcv,foxy_linemargin,foxy_term,foxy_mrr`;
            const serviceResponse = await axios.get(getUrl, { headers });
            const service = serviceResponse.data as WonService;

            context.log('Retrieved service data:', service);

            // Calculate the expected compensation
            const expectedComp = calculateExpectedComp(service, context);

            // Update the service with the calculated compensation
            const updateUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices(${formattedId})`;
            await axios.patch(updateUrl, {
                foxy_expectedcomp: expectedComp
            }, { headers });

            results.push({ 
                id, 
                status: 'updated',
                expectedComp,
                serviceData: service
            });
        }

        return { 
            ...corsResponse,
            status: 200,
            body: JSON.stringify({ 
                message: "Successfully updated compensation values",
                results 
            }),
            headers: { 
                "Content-Type": "application/json",
                ...corsResponse?.headers
            }
        };
    } catch (error) {
        context.error('Error in calculateWonServicesComp:', error);
        if (axios.isAxiosError(error)) {
            context.log('Axios error response:', error.response?.data);
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

app.http('calculateWonServicesComp', {
    methods: ['POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: calculateWonServicesComp
});
