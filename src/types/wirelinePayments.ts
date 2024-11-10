export interface IncomingWirelinePayment {
  foxy_incomingpaymentid: string;
  foxy_name: string;
  foxy_paymentamount: number;
  foxy_paymentamount_base: number;
  foxy_existingmrr: number;
  foxy_existingmrr_base: number;
  foxy_newmrr: number;
  foxy_newmrr_base: number;
  foxy_netnewtcv: number;
  foxy_netnewtcv_base: number;
  foxy_paymentdate: string;
  foxy_quotesigndate: string;
  foxy_copcreateddate: string;
  foxy_revenuetype: string;
  foxy_opportunitynumber: string;
  foxy_productname: string;
  foxy_productdescription: string;
  foxy_opticsite: string;
  foxy_companyname: string;
  foxy_lineofbusiness: string;
  foxy_term: string;
  foxy_margin: number;
  foxy_renewalrate: number;
  foxy_netnewrate: number;
  statuscode: number;
  statecode: number;
  createdon: string;
  modifiedon: string;
  foxy_WonService?: {
    foxy_serviceid: string;
  } | null;
  crc9f_paydate: string;
  crc9f_ordernumber?: string;
}
