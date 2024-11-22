import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { dataverseUrl } from "../shared/dataverseAuth";
import { corsHandler } from "../shared/cors";

export async function checkDuplicateBuildings(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Starting checkDuplicateBuildings function');
  
  const corsResponse = corsHandler(request, context);
  if (corsResponse && request.method === 'OPTIONS') {
    return corsResponse;
  }

  // Get authorization header from request
  const userToken = request.headers.get('authorization');
  if (!userToken) {
    context.log('No authorization header provided');
    return {
      ...corsResponse,
      status: 401,
      body: JSON.stringify({ error: "Authorization header is required" })
    };
  }

  // Get and validate query parameters
  const streetNumber = request.query.get('streetNumber');
  const streetName = request.query.get('streetName');

  context.log('Query parameters:', { streetNumber, streetName });

  if (!streetNumber || !streetName) {
    context.log('Missing required parameters:', { streetNumber, streetName });
    return {
      ...corsResponse,
      status: 400,
      body: JSON.stringify({
        error: "Missing required parameters",
        details: {
          streetNumber: streetNumber ? "provided" : "missing",
          streetName: streetName ? "provided" : "missing"
        }
      })
    };
  }

  try {
    // Use the user's token directly
    const accessToken = userToken.replace('Bearer ', '');

    // Format the filter query with proper string value formatting
    const filterQuery = `foxy_streetnumber eq '${streetNumber}' and foxy_streetname eq '${streetName}'`;
    const apiUrl = `${dataverseUrl}/api/data/v9.1/foxy_buildings?$filter=${encodeURIComponent(filterQuery)}`;

    context.log('Making request to Dataverse:', { 
      url: apiUrl,
      filterQuery
    });

    // Make request to Dataverse with explicit headers
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

    context.log('Received response from Dataverse:', {
      status: response.status,
      data: response.data
    });

    // If we get a successful response, log the first result to see the field names
    if (response.data?.value?.length > 0) {
      context.log('Sample building data:', response.data.value[0]);
    }

    return {
      ...corsResponse,
      body: JSON.stringify({
        duplicates: response.data.value || []
      }),
      headers: {
        "Content-Type": "application/json",
        ...corsResponse?.headers
      }
    };
  } catch (error) {
    context.error('Error in checkDuplicateBuildings:', error);
    
    // Check if it's an axios error with a response
    if (axios.isAxiosError(error)) {
      context.log('Dataverse API error response:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });

      const status = error.response?.status || 500;
      const message = error.response?.data?.error?.message || error.message;

      return {
        ...corsResponse,
        status,
        body: JSON.stringify({
          error: `Error checking for duplicate buildings: ${message}`
        }),
        headers: {
          "Content-Type": "application/json",
          ...corsResponse?.headers
        }
      };
    }

    return {
      ...corsResponse,
      status: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      headers: {
        "Content-Type": "application/json",
        ...corsResponse?.headers
      }
    };
  }
}

app.http('checkDuplicateBuildings', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: checkDuplicateBuildings
});
