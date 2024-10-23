"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const httpTrigger = async function (context, req) {
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
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let allPlaces = [];
        let nextPageToken = null;
        let retries = 0;
        for (let i = 0; i < 3; i++) {
            let nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&key=${apiKey}`;
            if (nextPageToken) {
                nearbySearchUrl += `&pagetoken=${nextPageToken}`;
            }
            context.log(`Requesting: ${nearbySearchUrl}`);
            const response = await axios_1.default.get(nearbySearchUrl);
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
                        const testResponse = await axios_1.default.get(testUrl);
                        if (testResponse.data.status === 'OK' || testResponse.data.status === 'ZERO_RESULTS') {
                            break;
                        }
                    }
                    catch (err) {
                        context.log.error('Error while testing next_page_token:', err);
                    }
                    retries++;
                }
                if (retries === 5) {
                    context.log.warn('next_page_token did not become active after multiple retries.');
                    break;
                }
            }
            else {
                break;
            }
        }
        const detailedPlaces = await Promise.all(allPlaces.map(async (place) => {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=website,formatted_phone_number&key=${apiKey}`;
            const detailsResponse = await axios_1.default.get(detailsUrl);
            return {
                ...place,
                website: detailsResponse.data.result.website,
                phone_number: detailsResponse.data.result.formatted_phone_number
            };
        }));
        const filteredPlaces = detailedPlaces
            .filter(place => place.business_status === 'OPERATIONAL')
            .map(place => {
            const { price_level, user_ratings_total, rating, plus_code, photos, opening_hours, reference, icon, icon_background_color, icon_mask_base_uri, geometry, vicinity, business_status, ...filteredPlace } = place;
            // Remove 'point_of_interest' from types array
            const types = filteredPlace.types.filter(type => type !== 'point_of_interest');
            return {
                ...filteredPlace,
                address: vicinity || undefined,
                types: types
            };
        });
        const result = {
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
    }
    catch (error) {
        context.log.error('An error occurred:', error);
        context.res = {
            status: 500,
            body: "An error occurred while processing your request."
        };
    }
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map