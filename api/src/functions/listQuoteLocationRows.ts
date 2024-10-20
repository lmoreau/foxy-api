import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { getAccessToken, dataverseUrl } from "../shared/dataverseAuth";

interface RequestBody {
    id?: string;
}

const allowedOrigin = 'http://localhost:3000';

const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Azure Function to list quote locations for a specific quote request from Dataverse
 */
export async function listQuoteLocationRows(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
        return { headers: corsHeaders, status: 204 };
    }

    let id: string | undefined;

    // Check query parameters
    id = request.query.get('id');

    // If not in query, check request body
    if (!id) {
        const body: RequestBody = await request.json().catch(() => ({}));
        id = body.id;
    }

    if (!id) {
        return { 
            status: 400, 
            body: JSON.stringify({
                error: "Missing id",
                message: "Please provide a GUID for the quote request in the query parameters or request body",
                example: {
                    queryParam: "?id=your-guid-here",
                    requestBody: { id: "your-guid-here" }
                }
            }),
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        };
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_foxyquoterequestlocations`;
        const filter = `$filter=foxy_FoxyQuoteRequest/foxy_foxyquoterequestid eq ${id}`;
        const expand = '$expand=foxy_CompanyLocation($select=foxy_accountlocationid;$expand=foxy_Building($select=foxy_fulladdress))';
        const select = '$select=foxy_foxyquoterequestlocationid,foxy_locationid,createdon,modifiedon,statuscode,_foxy_building_value';
        const query = `${apiUrl}?${filter}&${expand}&${select}`;

        context.log('API query:', query);

        const response = await axios.get(query, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json",
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Prefer": "odata.include-annotations=\"*\""
            }
        });

        context.log('API response:', JSON.stringify(response.data, null, 2));

        // Process the response to include the full address in the main object
        const processedData = response.data.value.map((item: any) => ({
            ...item,
            fullAddress: item.foxy_CompanyLocation && item.foxy_CompanyLocation.foxy_Building 
                ? item.foxy_CompanyLocation.foxy_Building.foxy_fulladdress 
                : 'N/A'
        }));

        return { 
            body: JSON.stringify({ value: processedData }), 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        };
    } catch (error) {
        context.log(`Error retrieving quote locations: ${error.message}`);
        const status = axios.isAxiosError(error) ? error.response?.status || 500 : 500;
        const message = axios.isAxiosError(error) ? error.response?.data?.error?.message || error.message : error.message;
        return { 
            status, 
            body: JSON.stringify({
                error: "Failed to retrieve quote locations",
                message: message,
                details: axios.isAxiosError(error) ? error.response?.data : undefined
            }),
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        };
    }
}

// Register the HTTP trigger
app.http('listQuoteLocationRows', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: listQuoteLocationRows
});
