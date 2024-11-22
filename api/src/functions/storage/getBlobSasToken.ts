import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol } from "@azure/storage-blob";

export async function getBlobSasToken(_request: HttpRequest): Promise<HttpResponseInit> {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    // Validate required environment variables
    if (!accountName || !accountKey || !containerName) {
        return {
            status: 500,
            jsonBody: {
                error: "Missing required storage configuration"
            }
        };
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(
        accountName,
        accountKey
    );

    const sasOptions = {
        containerName: containerName,
        permissions: BlobSASPermissions.parse("racw"),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
        protocol: SASProtocol.Https,
        version: "2022-11-02"
    } as const;

    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
    ).toString();

    return {
        jsonBody: {
            sasToken,
            storageUri: `https://${accountName}.blob.core.windows.net`,
            containerName
        }
    };
}

app.http('getBlobSasToken', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: getBlobSasToken
});
