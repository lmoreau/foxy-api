"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const httpTrigger = async function (context, req) {
    context.log('TypeScript HTTP trigger function processed a request.');
    const address = (req.query.address || (req.body && req.body.address));
    if (!address) {
        context.res = {
            status: 400,
            body: "Please provide an address in the query string or request body"
        };
        return;
    }
    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios_1.default.get(geocodingUrl);
        if (response.data.status !== 'OK') {
            context.log.error(`Google Geocoding API error: ${response.data.status}`);
            context.res = {
                status: 400,
                body: `Error: ${response.data.status}`
            };
            return;
        }
        const coordinates = response.data.results[0].geometry.location;
        context.res = {
            status: 200,
            body: {
                address: address,
                coordinates: coordinates
            }
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