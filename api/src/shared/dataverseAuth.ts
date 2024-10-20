import { ClientSecretCredential } from "@azure/identity";

// Environment variables
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
export const dataverseUrl = process.env.DATAVERSE_URL;

// Create a credential using Azure AD app registration
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

/**
 * Get an access token for Dataverse API
 * @returns {Promise<string>} The access token
 */
export async function getAccessToken(): Promise<string> {
    const scope = `${dataverseUrl}/.default`;
    const token = await credential.getToken(scope);
    return token.token;
}
