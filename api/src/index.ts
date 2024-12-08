import { app } from "@azure/functions";

// Import all other functions
import "./functions/quotes/deleteQuoteLocation";
import "./functions/accounts/getAccountById";
import "./functions/opportunities/getOpportunityById";
import "./functions/quotes/getQuoteLineItemById";
import "./functions/quotes/getQuoteLocationById";
import "./functions/quotes/getQuoteRequestById";
import "./functions/accounts/listAccountLocationRows";
import "./functions/opportunities/listOpportunityRows";
import "./functions/listProductByRow";
import "./functions/listWirelessProductByRow";
import "./functions/quotes/listQuoteLineItemByRow";
import "./functions/quotes/listQuoteLocationRows";
import "./functions/ledger/listWonServices";
import "./functions/quotes/createQuoteLineItem";
import "./functions/quotes/updateQuoteLineItem";
import "./functions/quotes/createQuoteRequest";
import "./functions/quotes/deleteQuoteLineItem";
import "./functions/posts/listPosts";
import "./functions/posts/listAnnotations";
import "./functions/posts/createPost";
import "./functions/users/listUsers";
import "./functions/quotes/createFoxyQuoteRequestLocation";
import "./functions/storage/getBlobSasToken";
import "./functions/quotes/listQuoteRequests";
import "./functions/quotes/updateQuoteRequest";
import "./functions/checkDuplicateBuildings";
import "./functions/ledger/createResidualScrubAudit";
import "./functions/ledger/recalculateWonServicePayments";
import "./functions/ledger/listWonServicesForComp";
import "./functions/ledger/listResidualAuditByRows";
import "./functions/ledger/listAccountsForResidualCheck";
import "./functions/ledger/listIncomingWirelinePayments";
import "./functions/ledger/listMasterResidualRows";
import "./functions/ledger/listWirelineResidualRows";
import "./functions/ledger/updateWonService";
import "./functions/ledger/updateIncomingPayment";
import "./functions/ledger/updateAccountWirelineResiduals";
import "./functions/ledger/listRogersWirelineRecords";
import "./functions/ledger/listMasterResidualBillingRows";
import "./functions/ledger/listIncomingWirelinePaymentsByWonService";
import "./functions/bugs/createJiraIssue";
import "./functions/ledger/listRevenueServices";
import "./functions/ledger/updateRenewalDisposition";
import "./functions/ledger/updateRapidPlanalyzer";
import "./functions/ledger/getRapidPlanalyzer";

// Export all other functions
export * from "./functions/quotes/deleteQuoteLocation";
export * from "./functions/accounts/getAccountById";
export * from "./functions/opportunities/getOpportunityById";
export * from "./functions/quotes/getQuoteLineItemById";
export * from "./functions/quotes/getQuoteLocationById";
export * from "./functions/quotes/getQuoteRequestById";
export * from "./functions/accounts/listAccountLocationRows";
export * from "./functions/opportunities/listOpportunityRows";
export * from "./functions/listProductByRow";
export * from "./functions/listWirelessProductByRow";
export * from "./functions/quotes/listQuoteLineItemByRow";
export * from "./functions/quotes/listQuoteLocationRows";
export * from "./functions/ledger/listWonServices";
export * from "./functions/quotes/createQuoteLineItem";
export * from "./functions/quotes/updateQuoteLineItem";
export * from "./functions/quotes/createQuoteRequest";
export * from "./functions/quotes/deleteQuoteLineItem";
export * from "./functions/posts/listPosts";
export * from "./functions/posts/listAnnotations";
export * from "./functions/posts/createPost";
export * from "./functions/users/listUsers";
export * from "./functions/quotes/createFoxyQuoteRequestLocation";
export * from "./functions/storage/getBlobSasToken";
export * from "./functions/quotes/listQuoteRequests";
export * from "./functions/quotes/updateQuoteRequest";
export * from "./functions/checkDuplicateBuildings";
export * from "./functions/ledger/createResidualScrubAudit";
export * from "./functions/ledger/recalculateWonServicePayments";
export * from "./functions/ledger/listWonServicesForComp";
export * from "./functions/ledger/listResidualAuditByRows";
export * from "./functions/ledger/listAccountsForResidualCheck";
export * from "./functions/ledger/listIncomingWirelinePayments";
export * from "./functions/ledger/listMasterResidualRows";
export * from "./functions/ledger/listWirelineResidualRows";
export * from "./functions/ledger/updateWonService";
export * from "./functions/ledger/updateIncomingPayment";
export * from "./functions/ledger/updateAccountWirelineResiduals";
export * from "./functions/ledger/listRogersWirelineRecords";
export * from "./functions/ledger/listMasterResidualBillingRows";
export * from "./functions/ledger/listIncomingWirelinePaymentsByWonService";
export * from "./functions/bugs/createJiraIssue";
export * from "./functions/ledger/listRevenueServices";
export * from "./functions/ledger/updateRenewalDisposition";
export * from "./functions/ledger/updateRapidPlanalyzer";
export * from "./functions/ledger/getRapidPlanalyzer";

// Export the app instance
export default app;
