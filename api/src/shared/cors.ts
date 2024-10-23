import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export function corsHandler(req: HttpRequest, context: InvocationContext): HttpResponseInit | undefined {
  context.log('HTTP trigger function processed a request. RequestUri=%s', req.url);

  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  if (req.method === 'OPTIONS') {
    context.log('Handling OPTIONS request');
    return {
      status: 204,
      headers
    };
  }

  return {
    headers
  };
}
