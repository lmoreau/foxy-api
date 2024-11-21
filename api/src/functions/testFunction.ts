import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function testFunction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Test function processed a request.');
    return {
        body: `Hello from Premium Function App! Time: ${new Date().toISOString()}`
    };
}

app.http('testFunction', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: testFunction,
    route: 'test'
});
