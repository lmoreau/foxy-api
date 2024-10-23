"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const openrouterFunction = async function (context, req) {
    context.log('OpenRouter function invoked.', {
        requestId: context.invocationId,
        timestamp: new Date().toISOString()
    });
    const apiKey = process.env.OPENROUTER_API_KEY;
    context.log('Checking OPENROUTER_API_KEY', {
        keyExists: !!apiKey,
        keyLength: apiKey ? apiKey.length : 0
    });
    if (!apiKey) {
        context.log.error('OPENROUTER_API_KEY is not set in the environment variables');
        context.res = {
            status: 500,
            body: JSON.stringify({ error: "OPENROUTER_API_KEY is not set in the environment variables" }),
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    const inputData = req.body;
    context.log('Validating input data', {
        hasBody: !!inputData,
        hasBuildingId: !!inputData?.buildingId,
        hasFullAddress: !!inputData?.foxy_fulladdress,
        hasCombinedPlaces: !!inputData?.combinedPlaces,
        combinedPlacesLength: inputData?.combinedPlaces?.length
    });
    if (!inputData || !inputData.buildingId || !inputData.foxy_fulladdress || !inputData.combinedPlaces) {
        context.log.error('Invalid input data:', JSON.stringify(inputData));
        context.res = {
            status: 400,
            body: JSON.stringify({ error: "Invalid input data" }),
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    context.log('Input data:', JSON.stringify(inputData, null, 2));
    const systemPrompt = `You are being sent a JSON array by the user. Your task is to remove any rows where the address is not considered a match with the provided foxy_fulladdress, which in this case is "1 Dundas St W, Toronto, ON M5B 2H1, Canada."

-  The key foxy_fulladdress is the standard for comparison. The "address" value on each row must be compared to this.

-  Use your best judgment to determine if the addresses match. Minor variations, such as abbreviations ("St" vs. "Street") or alternative representations ("West" vs. "W"), are acceptable as matching. For example, "1 Dundas Street West" and "1 Dundas St W" should be treated as the same location.

-  However, if the address contains a different street number (e.g., "7 Dundas St W" or "15 Dundas St W") or a completely different street name, it should be considered a non-match.

-  If the address is incomplete (e.g., missing a street number), consider it a non-match unless there is strong evidence that it represents the same location.

-  You are to return an array with **just the place_id** of the rows that should be removed. Do not return any additional information or formatting.

Here are examples of how you should process addresses:

-  "36 Dundas Street West, Toronto ON M5G 3C2" (Remove) - Different street number.

-  "1 Dundas Street West, Toronto ON M5G 1Z3" (Keep) - Matches despite slight postal code difference.

-  "Dundas Street West, Toronto ON M5G 1Z3" (Remove) - Incomplete address, no street number.

-  "Eaton Centre, 1 Dundas Street West, Toronto" (Keep) - Clear match to 1 Dundas Street West.

Once you have identified the non-matching rows, return an array with their **place_id** values. No additional text or explanation is needed.`;
    try {
        const model = 'anthropic/claude-3.5-sonnet';
        context.log('Preparing OpenRouter API call', {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            model: model,
            inputDataLength: JSON.stringify(inputData).length
        });
        const startTime = Date.now();
        const response = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
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
        const endTime = Date.now();
        context.log('Received response from OpenRouter API', {
            statusCode: response.status,
            responseTime: endTime - startTime,
            responseDataLength: JSON.stringify(response.data).length,
            model: response.data.model // Log the model returned by the API
        });
        let processedJson = response.data.choices[0].message.content;
        context.log('Raw response content:', processedJson);
        // Ensure the response is valid JSON
        try {
            context.log('Parsing JSON response');
            const parsedJson = JSON.parse(processedJson);
            processedJson = JSON.stringify(parsedJson, null, 2);
            context.log('JSON parsed successfully');
        }
        catch (error) {
            context.log.error('Error parsing JSON response:', error);
            context.log('Attempting to fix JSON formatting issues');
            // If it's not valid JSON, attempt to fix common issues
            processedJson = processedJson.replace(/(\w+):/g, '"$1":');
            processedJson = processedJson.replace(/'/g, '"');
            processedJson = processedJson.replace(/,\s*([\]}])/g, '$1');
            context.log('Processed JSON after fixes:', processedJson);
        }
        context.log('Final processed JSON:', processedJson);
        context.res = {
            status: 200,
            body: processedJson,
            headers: { 'Content-Type': 'application/json' }
        };
    }
    catch (error) {
        const axiosError = error;
        context.log.error('Error calling OpenRouter API:', axiosError);
        if (axios_1.default.isAxiosError(axiosError)) {
            context.log.error('Axios error details:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                headers: axiosError.response?.headers,
                data: axiosError.response?.data
            });
        }
        context.res = {
            status: 500,
            body: JSON.stringify({
                error: "An error occurred while processing the request.",
                details: axiosError.message
            }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
    context.log('OpenRouter function completed.', {
        requestId: context.invocationId,
        timestamp: new Date().toISOString(),
        responseStatus: context.res.status
    });
};
exports.default = openrouterFunction;
//# sourceMappingURL=index.js.map