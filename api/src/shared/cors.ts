import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

const allowedOrigins = [
  'http://localhost:3000',  // Local development
  process.env.WEBSITE_URL   // Production URL from environment variable
].filter(Boolean); // Remove any undefined values

export function corsHandler(req: HttpRequest, context: InvocationContext): HttpResponseInit | undefined {
  context.log('HTTP trigger function processed a request. RequestUri=%s', req.url);

  // Get the origin from the request
  const origin = req.headers.get('origin');
  
  // Check if the origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
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
