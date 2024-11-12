export interface QuoteLineItem {
  foxy_foxyquoterequestlineitemid: string;
  foxy_quantity: number;
  foxy_each: number;
  foxy_mrr: number;
  foxy_linetcv: number;
  foxy_term: number;
  foxy_revenuetype: number;
  foxy_renewaltype: string;
  foxy_renewaldate: string;
  foxy_Product: {
    name: string;
  };
}

export interface Product {
  name: string;
}

export interface QuoteLocation {
  foxy_foxyquoterequestlocationid: string;
  foxy_locationid: string;
  foxy_Building: {
    foxy_fulladdress: string;
    foxy_buildingid: string;
  };
}

export interface QuoteRequest {
  foxy_Account: {
    name: string;
    accountid: string;
  };
  foxy_quoteid: string;
  owninguser: {
    fullname: string;
    internalemailaddress: string;
    systemuserid: string;
    ownerid: string;
  };
}
