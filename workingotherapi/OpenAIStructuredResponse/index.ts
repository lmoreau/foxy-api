import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import OpenAI from "openai";

const MAX_TOKENS = 4000; // Set a safe limit

interface Company {
    name: string;
    place_id: string;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    if (!req.body || typeof req.body !== 'object' || !req.body.combinedPlaces || !req.body.foxy_fulladdress) {
        context.res = {
            status: 400,
            body: "Please pass a valid request body with a combinedPlaces array and foxy_fulladdress"
        };
        return;
    }

    const combinedPlaces: Company[] = req.body.combinedPlaces;
    const foxy_fulladdress: string = req.body.foxy_fulladdress;

    try {
        let allFilteredPlaceIds: string[] = [];
        
        // Process in chunks
        for (let i = 0; i < combinedPlaces.length; i += 50) {
            const chunk = combinedPlaces.slice(i, i + 50);
            const chunkContent = JSON.stringify(chunk);
            
            context.log(`Processing chunk ${i/50 + 1}`);
            
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4-0613",
                    messages: [
                        {
                            role: "system",
                            content: "Your task is to process a list of companies and their addresses. For each company, compare its address to the reference address provided (foxy_fulladdress).\n\n**Matching Criteria:**\n- **Street Number and Street Name:** The company's address should have the same street number and street name as the reference address. Allow for minor variations such as \"1\" vs. \"One\" and \"Street\" vs. \"St.\"\n- **Direction Suffixes:** Consider \"West\" and \"W\" (and other directions like \"East\"/\"E\", \"North\"/\"N\", \"South\"/\"S\") as equivalent.\n- **Ignore Differences In:**\n  - Postal codes or ZIP codes.\n  - Province or state names.\n  - Missing address components (e.g., missing postal code or province).\n  - Additional details like floor numbers, suite numbers, or building names.\n\n**Examples of Addresses That Should Be Considered a Match:**\n- \"1 Dundas Street West, Toronto\"\n- \"One Dundas St W, Toronto\"\n- \"1 Dundas St., Toronto ON\"\n- \"1 Dundas Street West #2500, Toronto\"\n- \"Eaton Centre, 1 Dundas Street West, Toronto\"\n\n**Examples of Addresses That Should Not Be Considered a Match:**\n- Addresses with a different street number (e.g., \"2 Dundas Street West\").\n- Addresses with a different street name (e.g., \"1 Lake Street West\").\n- Addresses with a different city (though this should not occur based on your data).\n\n**Task:**\n- **Include** companies whose addresses match the reference address based on the criteria above.\n- **Exclude** companies whose addresses do not match.\n- **Output:** Return an array of `place_id`s for companies **to be excluded** (i.e., those that do not match the reference address).\n\nRemember to focus on the street number and street name. Minor variations in other address components should not lead to exclusion."
                        },
                        {
                            role: "user",
                            content: `foxy_fulladdress: ${foxy_fulladdress}\ncompanies: ${chunkContent}`
                        }
                    ],
                    functions: [
                        {
                            name: "filter_companies",
                            description: "Filter out companies whose addresses don't match the reference address. Return an array of place_ids for non-matching companies.",
                            parameters: {
                                type: "object",
                                properties: {
                                    filtered_place_ids: {
                                        type: "array",
                                        items: { type: "string" },
                                        description: "Array of place_ids for companies with non-matching addresses"
                                    }
                                },
                                required: ["filtered_place_ids"]
                            }
                        }
                    ],
                    function_call: { name: "filter_companies" }
                });

                context.log('OpenAI API response:', JSON.stringify(completion));

                const functionCall = completion.choices[0].message.function_call;
                if (functionCall && functionCall.name === "filter_companies") {
                    const result = JSON.parse(functionCall.arguments || "{}");
                    allFilteredPlaceIds = allFilteredPlaceIds.concat(result.filtered_place_ids);
                    context.log(`Processed chunk ${i/50 + 1}`);
                }
            } catch (error: unknown) {
                context.log.error("Error processing chunk:", error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                context.res = {
                    status: 500,
                    body: `An error occurred while processing the request: ${errorMessage}`
                };
                return;
            }
        }

        context.res = {
            body: allFilteredPlaceIds
        };
        context.log('Successfully processed all data');
    } catch (error: unknown) {
        context.log.error("Error processing request:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        context.res = {
            status: 500,
            body: `An error occurred while processing the request: ${errorMessage}`
        };
    }
};

export default httpTrigger;