export interface AccountData {
  name: string;
  foxyflow_wirelineresiduals: number;
  accountid: string;
  foxy_cable?: boolean;
  foxy_datacentre?: boolean;
  foxy_fibreinternet?: boolean;
  foxy_gpon?: boolean;
  foxy_microsoft365?: boolean;
  foxy_res?: boolean;
  foxy_sip?: boolean;
  foxy_unison?: boolean;
}

export interface ResidualRecord {
  key: string;
  type: 'residual';
  foxyflow_product: string;
  foxyflow_rogerscompanyname: string;
  foxyflow_charge_item_code: string;
  foxyflow_month: string;
  foxyflow_actuals: string;
  foxyflow_billingnumber: string;
  foxyflow_residualserviceid: string;
}

export interface WirelineRecord {
  key: string;
  type: 'wireline';
  foxy_serviceid: string;
  foxy_description: string;
  foxy_charges: string;
  foxy_addressline1: string;
  foxy_city: string;
  foxy_province: string;
  foxy_postalcode: string;
  foxy_quantity: number;
  foxy_contractterm: number;
  foxyflow_estrenewaldtgible: string;
  foxy_estimatedenddate: string;
  foxy_billingeffectivedate: string;
  foxy_companyname: string;
  foxy_accountowner: string;
  foxy_sitename: string;
  foxy_signacct: string;
}

export interface MergedRecord {
  key: string;
  type: 'merged';
  // From WirelineRecord
  foxy_serviceid: string;
  foxy_description: string;
  foxy_charges: string;
  foxy_addressline1: string;
  foxy_city: string;
  foxy_province: string;
  foxy_postalcode: string;
  foxy_quantity: number;
  foxy_contractterm: number;
  foxy_estimatedenddate: string;
  foxy_billingeffectivedate: string;
  foxy_companyname: string;
  foxy_sitename: string;
  // From ResidualRecord
  foxyflow_charge_item_code: string;
  foxyflow_residualserviceid: string;
  // Original records for reference if needed
  wirelineRecord: WirelineRecord;
  residualRecord: ResidualRecord;
}

export interface GroupedAccountData {
  key: string;
  accountId: string;
  companyName: string;
  totalResidualAmount: number;
  totalWirelineCharges: number;
  children: (ResidualRecord | WirelineRecord | MergedRecord)[];
}

export interface AuditRecord {
  crc9f_residualscrubauditid: string;
  crc9f_newstatus: number;
  crc9f_updatedon: string;
  crc9f_note?: string;
  owninguser: {
    fullname: string;
  };
}

export type TableRecord = GroupedAccountData | ResidualRecord | WirelineRecord | MergedRecord;

export interface OpportunityRecord {
  id: string;
  opportunityid: string;
  name: string;
  accountId: string;
  actualclosedate: string;
  foxy_foxystage: string;
  stepname: string;
}
