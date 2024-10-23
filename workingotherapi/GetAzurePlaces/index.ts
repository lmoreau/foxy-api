import axios from 'axios';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

interface AzurePlace {
    poi: {
        name: string;
        phone?: string;
        url?: string;
        categories: string[];
    };
    address: {
        freeformAddress: string;
    };
    id: string;
}

interface BusinessResult {
    name: string;
    address: string;
    phone_number?: string;
    website?: string;
    types: string[];
    place_id: string;
    scope: string;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Processing HTTP request for GetNearbyBusinesses.');

    try {
        const latitude = req.query.lat;
        const longitude = req.query.lon;

        if (!latitude || !longitude) {
            context.res = {
                status: 400,
                body: JSON.stringify({ error: "Please provide 'lat' and 'lon' parameters in the query string." })
            };
            return;
        }

        const nearbyBusinesses = await queryAzureMaps(context, latitude, longitude);
        context.log(`Retrieved ${nearbyBusinesses.length} nearby businesses.`);

        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                businesses: nearbyBusinesses
            })
        };
    } catch (error) {
        handleError(context, error);
    }
};

async function queryAzureMaps(context: Context, latitude: string, longitude: string): Promise<BusinessResult[]> {
    const subscriptionKey = process.env.AZURE_MAPS_SUBSCRIPTION_KEY;
    const radius = 40; // Radius in meters
    const limit = 100; // Maximum number of results

    const nearbySearchUrl = `https://atlas.microsoft.com/search/nearby/json?api-version=1.0&subscription-key=${subscriptionKey}&lat=${latitude}&lon=${longitude}&radius=${radius}&limit=${limit}`;

    try {
        const response = await axios.get<{ results: AzurePlace[] }>(nearbySearchUrl);
        const results = response.data.results || [];

        return results.map(place => ({
            name: place.poi.name,
            address: place.address.freeformAddress,
            phone_number: place.poi.phone,
            website: place.poi.url,
            types: place.poi.categories,
            place_id: place.id,
            scope: "AZURE" // Added scope field
        }));
    } catch (error) {
        context.log.error('Error querying Azure Maps:', error);
        throw error;
    }
}

function handleError(context: Context, error: any): void {
    context.log.error('Error occurred:', error);

    if (error.response) {
        context.res = {
            status: 500,
            body: JSON.stringify({ error: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}` })
        };
    } else if (error.request) {
        context.res = {
            status: 503,
            body: JSON.stringify({ error: 'Service Unavailable: No response from external API.' })
        };
    } else {
        context.res = {
            status: 500,
            body: JSON.stringify({ error: `Unexpected Error: ${error.message}` })
        };
    }
}

export default httpTrigger;
