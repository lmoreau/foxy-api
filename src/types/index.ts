export interface QuoteLineItem {
  foxy_foxyquoterequestlineitemid: string;
  _foxy_product_value?: string;  // Made optional with ?
  foxy_Product?: {
    name: string;
    crc9f_requiresconfiguration?: boolean;
  };
  foxy_revenuetype: number;
  foxy_term: number;
  foxy_quantity: number;
  foxy_each: number;
  foxy_mrr: number;
  foxy_linetcv: number;
  foxy_margin?: number;
  foxy_comment?: string;
  foxy_renewaldate?: string;
  foxy_renewaltype?: string;
  foxy_existingqty?: number;
  foxy_existingmrr?: number;
  createdon?: string;
}

export interface Product {
  name: string;
  productid: string;
  crc9f_requiresconfiguration?: boolean;
}

export interface QuoteLocation {
  _foxy_building_value: string;
  _foxy_companylocation_value: string;
  _foxy_foxyquoterequest_value: string;
  foxy_locationid: string;
  foxy_foxyquoterequestlocationid: string;
  foxy_Building: {
    foxy_buildingid: string;
    foxy_fulladdress: string;
  };
}

export interface QuoteRequest {
  foxy_Account: {
    name: string;
    accountid: string;
  };
  foxy_quoteid: string;
  foxy_quotestage: number;
  owninguser: {
    fullname: string;
    internalemailaddress: string;
    systemuserid: string;
    ownerid: string;
  };
}
