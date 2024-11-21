import { app } from "@azure/functions";

// Import all functions
import "./functions/deleteQuoteLocation";
import "./functions/getAccountById";
import "./functions/getOpportunityById";
import "./functions/getQuoteLineItemById";
import "./functions/getQuoteLocationById";
import "./functions/getQuoteRequestById";
import "./functions/listAccountLocationRows";
import "./functions/listOpportunityRows";
import "./functions/listProductByRow";
import "./functions/listQuoteLineItemByRow";
import "./functions/listQuoteLocationRows";
import "./functions/createQuoteLineItem";
import "./functions/updateQuoteLineItem";
import "./functions/createQuoteRequest";
import "./functions/deleteQuoteLineItem";
import "./functions/listPosts";
import "./functions/listAnnotations";
import "./functions/createPost";
import "./functions/listUsers";
import "./functions/createFoxyQuoteRequestLocation";
import "./functions/getBlobSasToken";
import "./functions/listQuoteRequests";
import "./functions/updateQuoteRequest";

// Export all functions to ensure they're included in the build
export * from "./functions/deleteQuoteLocation";
export * from "./functions/getAccountById";
export * from "./functions/getOpportunityById";
export * from "./functions/getQuoteLineItemById";
export * from "./functions/getQuoteLocationById";
export * from "./functions/getQuoteRequestById";
export * from "./functions/listAccountLocationRows";
export * from "./functions/listOpportunityRows";
export * from "./functions/listProductByRow";
export * from "./functions/listQuoteLineItemByRow";
export * from "./functions/listQuoteLocationRows";
export * from "./functions/createQuoteLineItem";
export * from "./functions/updateQuoteLineItem";
export * from "./functions/createQuoteRequest";
export * from "./functions/deleteQuoteLineItem";
export * from "./functions/listPosts";
export * from "./functions/listAnnotations";
export * from "./functions/createPost";
export * from "./functions/listUsers";
export * from "./functions/createFoxyQuoteRequestLocation";
export * from "./functions/getBlobSasToken";
export * from "./functions/listQuoteRequests";
export * from "./functions/updateQuoteRequest";

// Export the app instance
export default app;
