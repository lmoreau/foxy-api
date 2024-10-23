import axios from 'axios';
import qs from 'qs';
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

interface Place {
    name: string;
    phone_number?: string | null;
    scope?: string;
    inFoxy?: boolean;
    [key: string]: any;
}

interface RelatedAccount {
    name: string;
    phone: string | null;
}

interface BuildingDetails {
    foxy_fulladdress: string;
    foxy_latitude: string;
    foxy_longitude: string;
}

// Normalize phone numbers
function normalizePhoneNumber(phone: string | null | undefined): string | null {
    if (!phone) return null;
    return phone.replace(/[^0-9]/g, '').replace(/^1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Processing HTTP request for GetOrchestrator.');

    // Set CORS headers
    context.res = {
        headers: {
            "Access-Control-Allow-Origin": process.env.FUNCTIONS_ENVIRONMENT === "Development" 
                ? "http://localhost:3000" 
                : "https://nice-pebble-081537d10.5.azurestaticapps.net",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Content-Type": "application/json"
        }
    };

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        context.res.status = 204;
        return;
    }

    try {
        const buildingId = extractAndValidateBuildingId(context, req);
        if (!buildingId) return;

        const accessToken = await getAccessToken(context);
        context.log('Obtained access token.');

        const buildingDetails = await queryDataverseBuilding(context, buildingId, accessToken);
        if (!buildingDetails) {
            context.res.status = 404;
            context.res.body = { error: "Building not found." };
            return;
        }

        const { foxy_fulladdress, foxy_latitude, foxy_longitude } = buildingDetails;

        if (!foxy_latitude || !foxy_longitude) {
            context.res.status = 400;
            context.res.body = { error: "Building does not have valid latitude and longitude." };
            return;
        }

        // Get the base URL and function keys from environment variables
        const baseUrl = process.env.FUNCTION_BASE_URL;
        const googlePlacesFunctionKey = process.env.GETGOOGLEPLACES_FUNCTION_KEY;
        const azurePlacesFunctionKey = process.env.GETAZUREPLACES_FUNCTION_KEY;

        // Call GetAzurePlaces with the lat/lon
        const azurePlacesResponse = await axios.get(`${baseUrl}/api/GetAzurePlaces?lat=${foxy_latitude}&lon=${foxy_longitude}&code=${azurePlacesFunctionKey}`);
        let azurePlaces: Place[] = azurePlacesResponse.data.businesses;  // Correct path for Azure Places

        // Call GetGooglePlaces with the lat/lon, including the function key
        const googlePlacesResponse = await axios.get(`${baseUrl}/api/GetGooglePlaces?latitude=${foxy_latitude}&longitude=${foxy_longitude}&code=${googlePlacesFunctionKey}`);
        let googlePlaces: Place[] = googlePlacesResponse.data.places; // Correct path for Google Places

        // Ensure both are arrays
        if (!Array.isArray(azurePlaces)) {
            context.log("azurePlaces is not an array. Defaulting to an empty array.");
            azurePlaces = [];
        }

        if (!Array.isArray(googlePlaces)) {
            context.log("googlePlaces is not an array. Defaulting to an empty array.");
            googlePlaces = [];
        }

        // Fetch related accounts from foxy_AccountLocation table
        const relatedAccounts = await queryRelatedAccounts(context, buildingId, accessToken);
        context.log('Related Accounts:', relatedAccounts);

        // Normalize phone numbers
        azurePlaces = azurePlaces.map(place => ({
            ...place,
            phone_number: normalizePhoneNumber(place.phone_number)
        }));

        // Normalize Google Places phone numbers
        googlePlaces = googlePlaces.map(place => ({
            ...place,
            phone_number: normalizePhoneNumber(place.phone_number)
        }));

        // Check for duplicates and set inFoxy flag based on related accounts
        const combinedPlaces = combinePlaces(azurePlaces, googlePlaces, relatedAccounts);

        // Call OpenAIStructuredResponse function
        let openAIStructuredResponseResult;
        try {
            context.log('Calling OpenAIStructuredResponse function');
            const openAIStructuredResponseFunctionKey = process.env.OPENAISTRUCTUREDRESPONSE_FUNCTION_KEY;
            if (!openAIStructuredResponseFunctionKey) {
                throw new Error('OPENAISTRUCTUREDRESPONSE_FUNCTION_KEY is not set in environment variables');
            }
            const response = await axios.post(
                `${baseUrl}/api/OpenAIStructuredResponse?code=${openAIStructuredResponseFunctionKey}`,
                {
                    buildingId,
                    foxy_fulladdress,
                    combinedPlaces
                }
            );
            context.log('OpenAIStructuredResponse function call successful');
            openAIStructuredResponseResult = response.data;
        } catch (error) {
            context.log.error('Error calling OpenAIStructuredResponse function:', error);
            openAIStructuredResponseResult = { error: 'Failed to process with OpenAIStructuredResponse' };
        }

        // Update the response body
        context.res.status = 200;
        context.res.body = { 
            buildingId,
            foxy_fulladdress,
            combinedPlaces,
            foxyAI: openAIStructuredResponseResult
        };
    } catch (error) {
        handleError(context, error);
    }
};

// Function to combine and deduplicate places from Azure, Google, and related accounts
function combinePlaces(azurePlaces: Place[], googlePlaces: Place[], relatedAccounts: RelatedAccount[]): Place[] {
    const combined: Place[] = [];
    const azureMap = new Map<string, Place>();

    // Log related accounts for debugging
    console.log('Related Accounts:', JSON.stringify(relatedAccounts, null, 2));

    // Step 1: Add all Azure places to the map using phone number as the key.
    azurePlaces.forEach(place => {
        if (place.phone_number) {
            azureMap.set(place.phone_number, { ...place });
        } else {
            combined.push({ ...place, inFoxy: false }); // If no phone number, add to combined list
        }
    });

    // Step 2: Iterate through Google places and match with Azure using phone number.
    googlePlaces.forEach(googlePlace => {
        let matchFound = false;
        if (googlePlace.phone_number) {
            if (azureMap.has(googlePlace.phone_number)) {
                const azurePlace = azureMap.get(googlePlace.phone_number)!;

                // Update the scope to reflect both sources.
                azurePlace.scope = "GOOGLE AZURE";

                // Optionally, replace the name if the Google name is more detailed.
                if (googlePlace.name && googlePlace.name.length > azurePlace.name.length) {
                    azurePlace.name = googlePlace.name;
                }

                // Check if this place matches any related account
                const matchingAccount = relatedAccounts.find(acc => 
                    (acc.phone && acc.phone === googlePlace.phone_number) || 
                    (acc.name && acc.name.toLowerCase() === googlePlace.name.toLowerCase())
                );

                if (matchingAccount) {
                    console.log(`Match found for ${googlePlace.name}: ${JSON.stringify(matchingAccount)}`);
                    azurePlace.inFoxy = true;
                } else {
                    console.log(`No match found for ${googlePlace.name}`);
                    azurePlace.inFoxy = false;
                }

                // Remove this Azure place from the map (already processed).
                azureMap.delete(googlePlace.phone_number);

                // Add to combined list.
                combined.push(azurePlace);
                matchFound = true;
            }
        }

        // If no match found, just add the Google place as is.
        if (!matchFound) {
            const matchingAccount = relatedAccounts.find(acc => 
                (acc.phone && acc.phone === googlePlace.phone_number) || 
                (acc.name && acc.name.toLowerCase() === googlePlace.name.toLowerCase())
            );
            combined.push({ 
                ...googlePlace, 
                inFoxy: !!matchingAccount 
            });
            console.log(`Google place ${googlePlace.name} inFoxy: ${!!matchingAccount}`);
        }
    });

    // Step 3: Add the remaining unmatched Azure places to the combined list.
    azureMap.forEach(place => {
        const matchingAccount = relatedAccounts.find(acc => 
            (acc.phone && acc.phone === place.phone_number) || 
            (acc.name && acc.name.toLowerCase() === place.name.toLowerCase())
        );
        combined.push({ 
            ...place, 
            inFoxy: !!matchingAccount 
        });
        console.log(`Azure place ${place.name} inFoxy: ${!!matchingAccount}`);
    });

    return combined;
}

// Extract and validate the building ID
function extractAndValidateBuildingId(context: Context, req: HttpRequest): string | null {
    let buildingId = ((req.query.id || (req.body && req.body.id)) as string || '').trim();
    buildingId = buildingId.replace(/^['"]+|['"]+$/g, '');
    context.log('Sanitized id:', buildingId);

    if (!buildingId) {
        context.res = {
            status: 400,
            body: { error: "Please provide an 'id' parameter in the query string or request body." }
        };
        return null;
    }

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(buildingId)) {
        context.res = {
            status: 400,
            body: { error: "The 'id' provided is not a valid GUID." }
        };
        return null;
    }

    return buildingId;
}

// Query related accounts from foxy_AccountLocation table in Dataverse
async function queryRelatedAccounts(context: Context, buildingId: string, accessToken: string): Promise<RelatedAccount[]> {
    const dataverseUrl = process.env.DATAVERSE_URL;
    const sanitizedDataverseUrl = dataverseUrl!.endsWith('/') ? dataverseUrl!.slice(0, -1) : dataverseUrl;
    
    // This query gets related accounts using foxy_AccountLocation
    const query = `foxy_accountlocations?$filter=_foxy_building_value eq ${buildingId}&$expand=foxy_Account($select=name,telephone1)`;

    context.log(`Constructed OData Query for related accounts: ${query}`);

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'odata.include-annotations=*'
    };

    try {
        const response = await axios.get(`${sanitizedDataverseUrl}/api/data/v9.2/${query}`, { headers });
        return response.data.value.map((accountLocation: any) => ({
            name: accountLocation.foxy_Account.name,
            phone: normalizePhoneNumber(accountLocation.foxy_Account.telephone1)
        }));
    } catch (error) {
        context.log.error('Error querying related accounts:', error);
        throw error;
    }
}

// Get Access Token
async function getAccessToken(context: Context): Promise<string> {
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const data = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: `${process.env.DATAVERSE_URL}/.default`
    };

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    try {
        const response = await axios.post(tokenUrl, qs.stringify(data), { headers });
        return response.data.access_token;
    } catch (error) {
        context.log.error('Error getting access token:', error);
        throw error;
    }
}

// Query Dataverse Building Details
async function queryDataverseBuilding(context: Context, buildingId: string, accessToken: string): Promise<BuildingDetails | null> {
    const dataverseUrl = process.env.DATAVERSE_URL;
    const sanitizedDataverseUrl = dataverseUrl!.endsWith('/') ? dataverseUrl!.slice(0, -1) : dataverseUrl;
    const query = `foxy_buildings(${buildingId})?$select=foxy_fulladdress,foxy_latitude,foxy_longitude`;

    context.log(`Constructed OData Query: ${query}`);

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'odata.include-annotations=*'
    };

    try {
        const response = await axios.get(`${sanitizedDataverseUrl}/api/data/v9.2/${query}`, { headers });
        return response.data ? {
            foxy_fulladdress: response.data.foxy_fulladdress,
            foxy_latitude: response.data.foxy_latitude,
            foxy_longitude: response.data.foxy_longitude
        } : null;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && error.response.status === 404) return null;
        throw error;
    }
}

// Handle Error Responses
function handleError(context: Context, error: any): void {
    context.log.error('Error occurred:', error);

    let errorMessage = 'An unexpected error occurred.';
    let statusCode = 500;

    if (axios.isAxiosError(error) && error.response) {
        statusCode = error.response.status;
        errorMessage = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (axios.isAxiosError(error) && error.request) {
        statusCode = 503;
        errorMessage = 'Service Unavailable: No response from external API.';
    } else if (error instanceof Error) {
        errorMessage = `Unexpected Error: ${error.message}`;
    }

    context.res = {
        status: statusCode,
        body: { error: errorMessage }
    };
}

export default httpTrigger;
