import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function helloWorld(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get('name') || 'world';

    return {
        body: `Hello, ${name}!`,
        headers: {
            'Content-Type': 'text/plain'
        }
    };
}

app.http('helloWorld', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: helloWorld,
    route: 'hello'
});
