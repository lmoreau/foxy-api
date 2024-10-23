import axios from 'axios';
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

interface Place {
    place_id: string;
    name: string;
    types: string[];
    website?: string;
    phone_number?: string;
    business_status?: string;
    price_level?: number;
    user_ratings_total?: number;
    rating?: number;
    plus_code?: any;
    photos?: any[];
    opening_hours?: any;
    reference?: string;
    icon?: string;
    icon_background_color?: string;
    icon_mask_base_uri?: string;
    geometry?: any;
    vicinity?: string;
    [key: string]: any;
}

interface FilteredPlace {
    place_id: string;
    name: string;
    types: string[];
    website?: string;
    phone_number?: string;
    address?: string;  // Changed to optional
}

interface GooglePlacesResponse {
    status: string;
    results: Place[];
    next_page_token?: string;
}

interface GooglePlaceDetailsResponse {
    result: {
        website?: string;
        formatted_phone_number?: string;
    };
}

interface FunctionResult {
    places: FilteredPlace[];
    totalPlacesFetched: number;
    status: string;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('TypeScript HTTP trigger function processed a request.');

    const latitude = req.query.latitude || (req.body && req.body.latitude);
    const longitude = req.query.longitude || (req.body && req.body.longitude);

    if (!latitude || !longitude) {
        context.res = {
            status: 400,
            body: "Please provide latitude and longitude in the query string or request body"
        };
        return;
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const radius = 30; // Radius in meters (30 meters)

        const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

        let allPlaces: Place[] = [];
        let nextPageToken: string | null = null;
        let retries = 0;

        for (let i = 0; i < 3; i++) {
            let nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`;

            if (nextPageToken) {
                nearbySearchUrl += `&pagetoken=${nextPageToken}`;
            }

            context.log(`Requesting: ${nearbySearchUrl}`);
            const response = await axios.get<GooglePlacesResponse>(nearbySearchUrl);

            if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
                context.log.error(`Google Places API error: ${response.data.status}`);
                break;
            }

            allPlaces = allPlaces.concat(response.data.results);
            context.log(`Fetched ${response.data.results.length} places. Total so far: ${allPlaces.length}`);

            if (response.data.next_page_token) {
                nextPageToken = response.data.next_page_token;
                retries = 0;

                while (retries < 5) {
                    try {
                        await delay(2000);
                        const testUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
                        const testResponse = await axios.get<GooglePlacesResponse>(testUrl);
                        if (testResponse.data.status === 'OK' || testResponse.data.status === 'ZERO_RESULTS') {
                            break;
                        }
                    } catch (err) {
                        context.log.error('Error while testing next_page_token:', err);
                    }
                    retries++;
                }

                if (retries === 5) {
                    context.log.warn('next_page_token did not become active after multiple retries.');
                    break;
                }
            } else {
                break;
            }
        }

        const detailedPlaces = await Promise.all(allPlaces.map(async (place) => {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=website,formatted_phone_number&key=${apiKey}`;
            const detailsResponse = await axios.get<GooglePlaceDetailsResponse>(detailsUrl);
            return {
                ...place,
                website: detailsResponse.data.result.website,
                phone_number: detailsResponse.data.result.formatted_phone_number
            };
        }));

        const filteredPlaces: FilteredPlace[] = detailedPlaces
            .filter(place => place.business_status === 'OPERATIONAL')
            .map(place => {
                const {
                    price_level,
                    user_ratings_total,
                    rating,
                    plus_code,
                    photos,
                    opening_hours,
                    reference,
                    icon,
                    icon_background_color,
                    icon_mask_base_uri,
                    geometry,
                    vicinity,
                    business_status,
                    ...filteredPlace
                } = place;

                // Remove 'point_of_interest' from types array
                const types = filteredPlace.types.filter(type => type !== 'point_of_interest');

                return {
                    ...filteredPlace,
                    address: vicinity || undefined,  // Use undefined if vicinity is not present
                    types: types
                };
            });

        const result: FunctionResult = {
            places: filteredPlaces,
            totalPlacesFetched: filteredPlaces.length,
            status: "OK"
        };

        context.log('Aggregated Query results:');
        context.log(JSON.stringify(result, null, 2));

        context.res = {
            status: 200,
            body: result
        };
    } catch (error) {
        context.log.error('An error occurred:', error);
        context.res = {
            status: 500,
            body: "An error occurred while processing your request."
        };
    }
};

export default httpTrigger;
