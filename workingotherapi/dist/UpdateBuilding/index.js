"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const httpTrigger = async function (context, req) {
    const id = req.query.id || (req.body && req.body.id);
    const lat = req.query.lat || (req.body && req.body.lat);
    const lng = req.query.lng || (req.body && req.body.lng);
    if (!id || !lat || !lng) {
        context.res = {
            status: 400,
            body: "Please pass id, lat, and lng on the query string or in the request body"
        };
        return;
    }
    try {
        const token = await getAccessToken();
        const result = await updateBuilding(id, lat, lng, token);
        context.res = {
            status: 200,
            body: result
        };
    }
    catch (error) {
        context.log.error('Error in UpdateBuilding function:', error);
        context.res = {
            status: 500,
            body: `An error occurred while updating the building record: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};
async function getAccessToken() {
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const dataverseUrl = process.env.DATAVERSE_URL;
    if (!tenantId || !clientId || !clientSecret || !dataverseUrl) {
        throw new Error('Missing required environment variables for authentication');
    }
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const data = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: `${dataverseUrl}/.default`
    };
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    try {
        const response = await axios_1.default.post(tokenUrl, qs_1.default.stringify(data), { headers });
        return response.data.access_token;
    }
    catch (error) {
        throw new Error(`Failed to obtain access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
async function updateBuilding(id, lat, lng, token) {
    const dataverseUrl = process.env.DATAVERSE_URL;
    if (!dataverseUrl) {
        throw new Error('DATAVERSE_URL environment variable is not set');
    }
    const sanitizedDataverseUrl = dataverseUrl.endsWith('/') ? dataverseUrl.slice(0, -1) : dataverseUrl;
    // Use the correct format for the ID in the URL
    const url = `${sanitizedDataverseUrl}/api/data/v9.2/foxy_buildings(${id.replace(/[{}]/g, '')})`;
    const data = {
        "foxy_latitude": parseFloat(lat),
        "foxy_longitude": parseFloat(lng)
    };
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Prefer': 'return=representation'
    };
    try {
        const response = await axios_1.default.patch(url, data, { headers });
        console.log('Dataverse API Response:', response.data);
        return { message: "Building updated successfully", data: response.data };
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('Dataverse API Error Response:', error.response.data);
            throw new Error(`Failed to update building: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        else {
            throw new Error(`Failed to update building: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map