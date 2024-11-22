import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl, getDataverseHeaders } from "../../shared/dataverseAuth";
import { corsHandler } from "../../shared/cors";

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

interface CompBreakdown {
    existingMRR: number;
    existingTCV: number;
    existingRate: number;
    existingComp: number;
    newMRR: number | null;
    newTCV: number | null;
    newRate: number | null;
    newComp: number | null;
    totalComp: number;
    explanation: string;
}

function getCommissionRate(marginPercent: number): number {
    if (marginPercent < 5) return 0;
    if (marginPercent < 15) return 0.06;
    if (marginPercent < 30) return 0.10;
    if (marginPercent < 50) return 0.14;
    if (marginPercent < 60) return 0.20;
    return 0.22;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatPercent(rate: number): string {
    return (rate * 100).toFixed(0) + '%';
}

function calculateExpectedComp(service: WonService, context: InvocationContext): CompBreakdown {
    context.log('Calculating for service:', service);

    // Convert margin to percentage for calculations
    const marginPercent = service.foxy_linemargin * 100;
    context.log('Line margin (%):', marginPercent);

    // Handle UPSELL or RENEWAL with positive MRR uptick
    if ((service.foxy_revenuetype === 612100002 || service.foxy_revenuetype === 612100003) && 
        service.foxy_mrruptick && service.foxy_mrruptick > 0) {
        
        context.log('Processing Upsell/Renewal with positive MRR uptick');

        // Only proceed with split calculation if it's not an Early Renewal for Renewals
        if (service.foxy_revenuetype === 612100003 && service.foxy_renewaltype === "Early Renewal") {
            return {
                existingMRR: service.foxy_mrr,
                existingTCV: service.foxy_tcv,
                existingRate: 0,
                existingComp: 0,
                newMRR: null,
                newTCV: null,
                newRate: null,
                newComp: null,
                totalComp: 0,
                explanation: "Early Renewal - No compensation"
            };
        }

        // Calculate existing MRR (total MRR - uptick)
        const existingMRR = service.foxy_mrr - service.foxy_mrruptick;
        const existingTCV = existingMRR * service.foxy_term;
        const existingComp = existingTCV * 0.05;

        const newTCV = service.foxy_mrruptick * service.foxy_term;
        const newRate = getCommissionRate(marginPercent);
        const newComp = newTCV * newRate;

        const explanation = `Existing: ${formatCurrency(existingMRR)}/mo * ${service.foxy_term} months * 5% = ${formatCurrency(existingComp)}\nNew: ${formatCurrency(service.foxy_mrruptick)}/mo * ${service.foxy_term} months * ${formatPercent(newRate)} = ${formatCurrency(newComp)}`;

        return {
            existingMRR,
            existingTCV,
            existingRate: 0.05,
            existingComp,
            newMRR: service.foxy_mrruptick,
            newTCV,
            newRate,
            newComp,
            totalComp: existingComp + newComp,
            explanation
        };
    }

    // Regular Renewal or Upsell without uptick
    if (service.foxy_revenuetype === 612100003 || service.foxy_revenuetype === 612100002) {
        if (service.foxy_renewaltype !== "Early Renewal") {
            const comp = service.foxy_tcv * 0.05;
            const type = service.foxy_revenuetype === 612100002 ? "Upsell (no uptick)" : "Regular Renewal";
            return {
                existingMRR: service.foxy_mrr,
                existingTCV: service.foxy_tcv,
                existingRate: 0.05,
                existingComp: comp,
                newMRR: null,
                newTCV: null,
                newRate: null,
                newComp: null,
                totalComp: comp,
                explanation: `${type}: ${formatCurrency(service.foxy_mrr)}/mo * ${service.foxy_term} months * 5% = ${formatCurrency(comp)}`
            };
        }
        return {
            existingMRR: service.foxy_mrr,
            existingTCV: service.foxy_tcv,
            existingRate: 0,
            existingComp: 0,
            newMRR: null,
            newTCV: null,
            newRate: null,
            newComp: null,
            totalComp: 0,
            explanation: "Early Renewal - No compensation"
        };
    }

    // Regular New/Net New
    if (service.foxy_revenuetype === 612100000 || service.foxy_revenuetype === 612100001) {
        const rate = getCommissionRate(marginPercent);
        const comp = service.foxy_tcv * rate;
        return {
            existingMRR: service.foxy_mrr,
            existingTCV: service.foxy_tcv,
            existingRate: rate,
            existingComp: comp,
            newMRR: null,
            newTCV: null,
            newRate: null,
            newComp: null,
            totalComp: comp,
            explanation: `New/Net New: ${formatCurrency(service.foxy_mrr)}/mo * ${service.foxy_term} months * ${formatPercent(rate)} = ${formatCurrency(comp)}`
        };
    }

    return {
        existingMRR: service.foxy_mrr,
        existingTCV: service.foxy_tcv,
        existingRate: 0,
        existingComp: 0,
        newMRR: null,
        newTCV: null,
        newRate: null,
        newComp: null,
        totalComp: 0,
        explanation: "No matching compensation rules"
    };
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
            const breakdown = calculateExpectedComp(service, context);

            // Update the service with the calculated compensation and breakdown
            const updateUrl = `${dataverseUrl}/api/data/v9.2/foxy_wonservices(${formattedId})`;
            await axios.patch(updateUrl, {
                foxy_expectedcomp: breakdown.totalComp,
                crc9f_expectedcompbreakdown: breakdown.explanation
            }, { headers });

            results.push({ 
                id, 
                status: 'updated',
                expectedComp: breakdown.totalComp,
                breakdown,
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
