import { app } from "@azure/functions";
import "./functions/deleteQuoteLocation";
import "./functions/getAccountById";
import "./functions/getOpportunityById";
import "./functions/getQuoteLineItemById";
import "./functions/getQuoteLocationById";
import "./functions/getQuoteRequestById";
import "./functions/listAccountLocationRows";
import "./functions/listAccountsForResidualCheck";
import "./functions/listMasterResidualRows";
import "./functions/listMasterResidualBillingRows";
import "./functions/listOpportunityRows";
import "./functions/listProductByRow";
import "./functions/listQuoteLineItemByRow";
import "./functions/listQuoteLocationRows";
import "./functions/listResidualAuditByRows";
import "./functions/listRogersWirelineRecords";
import "./functions/listWirelineResidualRows";
import "./functions/listWonServices";
import "./functions/updateAccountWirelineResiduals";
import "./functions/updateWonService";
import "./functions/calculateWonServicesComp";
import "./functions/helloWorld";
import "./functions/listIncomingWirelinePayments";
import "./functions/listWonServicesForComp";
import "./functions/updateIncomingPayment";
import "./functions/listIncomingWirelinePaymentsByWonService";
import "./functions/recalculateWonServicePayments";
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
import "./functions/createResidualScrubAudit";

export * from "./functions/listPosts";
export * from "./functions/createPost";
export * from "./functions/listAnnotations";
export * from "./functions/listUsers";
export * from "./functions/getBlobSasToken";

// Initialize the app
const functionApp = app;

// Export the initialized app
export default functionApp;
