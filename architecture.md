# Architecture Overview

This document provides an overview of the architecture of the React app, focusing on Dataverse operations, including record creation, deletion, and retrieval. It highlights key components, patterns, and any quirks to be aware of for future development.

## Key Components

### Authentication
- **dataverseAuth.ts**: Handles authentication using Azure AD app registration. It retrieves an access token for the Dataverse API using environment variables for `TENANT_ID`, `CLIENT_ID`, `CLIENT_SECRET`, and `DATAVERSE_URL`.

### Record Creation
- **createFoxyQuoteRequestLocation.ts**: Manages the creation of `foxy_foxyquoterequestlocation` records in Dataverse. It uses OData binding to relate records and includes robust error handling.

### Record Deletion
- **deleteQuoteLocation.ts**: Handles the deletion of `foxy_foxyquoterequestlocation` records. It uses Axios for HTTP requests and includes detailed logging and error handling.

### Record Retrieval
- **getOpportunityById.ts**: Retrieves `opportunity` records by ID. It supports both `GET` and `POST` methods for flexibility in providing the ID.

### Record Listing
- **listQuoteLocationRows.ts**: Lists quote locations for a specific quote request. It uses OData query options to efficiently retrieve and expand related data.

## Quirks and Patterns

- **Token Naming**: The `dataverseUrl` is used to construct the token scope, which is necessary for authentication.
- **OData Usage**: The app extensively uses OData options for efficient data retrieval and manipulation, which is a powerful feature of the Dataverse API.
- **Error Handling**: Functions include robust error handling with detailed logging and error messages, which is crucial for debugging and maintaining the app.

## Future Considerations

- Ensure environment variables are correctly set for authentication.
- Leverage OData options for efficient data operations.
- Maintain detailed logging and error handling for all functions.

This document serves as a reference for understanding the app's architecture and should be updated as the app evolves.
