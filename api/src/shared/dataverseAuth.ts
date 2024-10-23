import { HttpRequest } from "@azure/functions";

export const dataverseUrl = process.env.DATAVERSE_URL;

export interface DataverseHeaders {
    'Authorization': string;
    'OData-MaxVersion': string;
    'OData-Version': string;
    'Accept': string;
    'Content-Type': string;
    'Prefer': string;
}

/**
 * Get headers for Dataverse API using user's token
 * @param authHeader The Authorization header from the request
 * @returns {DataverseHeaders} The headers object
 */
export function getDataverseHeaders(authHeader: string): DataverseHeaders {
    if (!authHeader) {
        throw new Error('Authorization header is required');
    }

    return {
        'Authorization': authHeader,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'return=representation'
    };
}

/**
 * Extract token from request
 * @param req The HTTP request
 * @returns {string | null} The authorization token or null if not found
 */
export function getAuthToken(req: HttpRequest): string | null {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader;
}
