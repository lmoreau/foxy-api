import { app } from "@azure/functions";

// Initialize the app
const functionApp = app;

// Import all functions
import "./functions/getAccountById";
import "./functions/createFoxyQuoteRequestLocation";
import "./functions/createResidualScrubAudit";
import "./functions/deleteQuoteLocation";
import "./functions/getOpportunityById";
import "./functions/getQuoteLineItemById";
import "./functions/getQuoteLocationById";
import "./functions/getQuoteRequestById";
import "./functions/listAccountLocationRows";
import "./functions/listAccountsForResidualCheck";
import "./functions/listOpportunityRows";
import "./functions/listProductByRow";
import "./functions/listQuoteLineItemByRow";
import "./functions/listQuoteLocationRows";
import "./functions/listResidualAuditByRows";
import "./functions/listRogersWirelineRecords";
import "./functions/listWirelineResidualRows";
import "./functions/updateAccountWirelineResiduals";
import "./functions/helloWorld";  // Add the new hello world function

// Export the initialized app
export default functionApp;