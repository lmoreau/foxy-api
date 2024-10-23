"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const openrouterFunction = async function (context, req) {
    context.log('OpenRouter function processed a request.');
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        context.res = {
            status: 500,
            body: JSON.stringify({ error: "OPENROUTER_API_KEY is not set in the environment variables" }),
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    const inputData = req.body;
    if (!inputData || !inputData.buildingId || !inputData.foxy_fulladdress || !inputData.combinedPlaces) {
        context.res = {
            status: 400,
            body: JSON.stringify({ error: "Invalid input data" }),
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    const systemPrompt = `You are being sent a JSON array by the user. Your task is to first remove any where the address is incorrect. The value foxy_fulladdress is a location, such as "2 Wolford Crt, Keswick, ON, L4P 0B1". The "address" value on each row must match this. In some cases, it will not, such as "20 Wolford Crt, Keswick, ON, L4P 0B1" which is not the same location. There may also be oddities like "67 Lake Drive North, Keswick, ON, L4P 0B1" which really don't match. Your task is to review each row, and delete any that don't match using your best knowledge. You are to then return the EXACT SAME FORMAT JSON back to the user. You are NOT to add anything else, no intro, nothing, JUST the JSON ARRAY back with your changes.`;
    try {
        const response = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(inputData) }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        let processedJson = response.data.choices[0].message.content;
        // Ensure the response is valid JSON
        try {
            const parsedJson = JSON.parse(processedJson);
            processedJson = JSON.stringify(parsedJson, null, 2);
        }
        catch (error) {
            // If it's not valid JSON, attempt to fix common issues
            processedJson = processedJson.replace(/(\w+):/g, '"$1":');
            processedJson = processedJson.replace(/'/g, '"');
            processedJson = processedJson.replace(/,\s*([\]}])/g, '$1');
        }
        context.res = {
            status: 200,
            body: processedJson,
            headers: { 'Content-Type': 'application/json' }
        };
    }
    catch (error) {
        context.log.error('Error calling OpenRouter API:', error);
        context.res = {
            status: 500,
            body: JSON.stringify({ error: "An error occurred while processing the request." }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
exports.default = openrouterFunction;
//# sourceMappingURL=openrouter.js.map