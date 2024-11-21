import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHandler } from "../shared/cors";

interface GraphUser {
    displayName: string;
    mail: string;
    jobTitle?: string;
    id: string;
}

export async function getUserDetails(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const startTime = Date.now();
    context.log(`[Performance] Starting getUserDetails execution at ${new Date().toISOString()}`);

    const corsResponse = corsHandler(request, context);
    if (corsResponse && request.method === 'OPTIONS') {
        return corsResponse;
    }

    // Get authorization header from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
        context.log(`[Auth] Missing authorization header`);
        return {
            status: 401,
            jsonBody: { error: "Authorization header is required" }
        };
    }

    const searchParams = new URL(request.url).searchParams;
    const email = searchParams.get('email');
    if (!email) {
        context.log(`[Validation] Missing email parameter`);
        return {
            status: 400,
            jsonBody: { error: "Please provide an email address" }
        };
    }

    context.log(`[Info] Fetching details for email: ${email}`);

    try {
        // Extract token
        const accessToken = authHeader.replace('Bearer ', '');
        context.log(`[Auth] Token prefix: ${accessToken.substring(0, 10)}...`);

        // Test token with /me endpoint
        context.log('[Auth] Testing token with /me endpoint');
        const meResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });

        if (!meResponse.ok) {
            const meError = await meResponse.text();
            context.log('[Auth] Token test failed:', meError);
            throw new Error(`Token validation failed: ${meError}`);
        }

        const meData = await meResponse.json() as GraphUser;
        context.log('[Auth] Token test successful:', meData.displayName);

        // Get user details by email
        context.log('[API] Fetching user details from Graph API');
        const userStartTime = Date.now();
        const userResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${email}?$select=id,displayName,mail,jobTitle`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json'
            }
        });

        if (!userResponse.ok) {
            const userError = await userResponse.text();
            context.log('[API] Error fetching user details:', userError);
            throw new Error(`Failed to fetch user details: ${userError}`);
        }

        const user = await userResponse.json() as GraphUser;
        context.log(`[Performance] User details fetched in ${Date.now() - userStartTime}ms`);
        context.log('[API] User details:', user);

        // Get user's photo
        let photo = null;
        try {
            context.log('[API] Fetching user photo from Graph API');
            const photoStartTime = Date.now();
            const photoResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${email}/photo/$value`, {
                headers: {
                    'Authorization': authHeader
                }
            });
            
            if (photoResponse.ok) {
                const photoBuffer = await photoResponse.arrayBuffer();
                photo = Buffer.from(photoBuffer).toString('base64');
                context.log(`[API] Photo base64 prefix: ${photo.substring(0, 100)}`);
                context.log(`[Performance] Photo fetched and converted in ${Date.now() - photoStartTime}ms`);
            } else {
                const photoError = await photoResponse.text();
                context.log(`[API] Photo not found for user ${email}: ${photoError}`);
            }
        } catch (photoError) {
            context.log(`[API] Error fetching photo for user ${email}: ${photoError instanceof Error ? photoError.message : String(photoError)}`);
            // Continue without photo if not available
        }

        const totalDuration = Date.now() - startTime;
        context.log(`[Performance] Total execution time: ${totalDuration}ms`);

        const responseBody = {
            ...user,
            photo
        };

        return {
            status: 200,
            jsonBody: responseBody
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        context.log(`[Error] Error fetching user details: ${errorMessage}`);
        context.log('[Error] Full error:', error);
        if (error instanceof Error && error.stack) {
            context.log('[Error] Stack trace:', error.stack);
        }
        return {
            status: 500,
            jsonBody: {
                error: errorMessage
            }
        };
    }
}

app.http('getUserDetails', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: getUserDetails
});