"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const GetOpenRouter = async function (context, req) {
    context.log('GetOpenRouter function invoked.', {
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
        hasModel: !!inputData?.model,
        hasSystemPrompt: !!inputData?.system_prompt
    });
    if (!inputData || !inputData.model || !inputData.system_prompt) {
        context.log.error('Invalid input data:', JSON.stringify(inputData));
        context.res = {
            status: 400,
            body: JSON.stringify({ error: "Invalid input data" }),
            headers: { 'Content-Type': 'application/json' }
        };
        return;
    }
    context.log('Input data:', JSON.stringify(inputData, null, 2));
    try {
        const model = inputData.model;
        const systemPrompt = inputData.system_prompt;
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
    context.log('GetOpenRouter function completed.', {
        requestId: context.invocationId,
        timestamp: new Date().toISOString(),
        responseStatus: context.res.status
    });
};
exports.default = GetOpenRouter;
//# sourceMappingURL=GetOpenRouter.js.map