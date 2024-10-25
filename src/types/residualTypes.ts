export interface AccountData {
  accountid: string;
  name: string;
  foxyflow_wirelineresiduals: string;
  foxy_cable: boolean;
  foxy_datacentre: boolean;
  foxy_fibreinternet: boolean;
  foxy_gpon: boolean;
  foxy_microsoft365: boolean;
  foxy_res: boolean;
  foxy_sip: boolean;
  foxy_unison: boolean;
}

export interface ResidualRecord {
  crc9f_residualrowid: string;
  crc9f_accountid: string;
  crc9f_accountname: string;
  crc9f_amount: number;
  crc9f_date: string;
  crc9f_description: string;
  crc9f_notes: string;
  crc9f_opportunityid: string;
  crc9f_opportunityname: string;
  crc9f_product: string;
  crc9f_residualtype: string;
  crc9f_status: string;
  crc9f_type: string;
}

export interface WirelineRecord {
  crc9f_rogersrecordid: string;
  crc9f_accountid: string;
  crc9f_accountname: string;
  crc9f_amount: number;
  crc9f_date: string;
  crc9f_description: string;
  crc9f_notes: string;
  crc9f_opportunityid: string;
  crc9f_opportunityname: string;
  crc9f_product: string;
  crc9f_residualtype: string;
  crc9f_status: string;
  crc9f_type: string;
}

export interface OpportunityRecord {
  opportunityid: string;
  name: string;
  actualvalue: number;
  foxy_sfdcoppid: string;
  foxy_opportunitytype: number;
  statuscode: number;
  actualclosedate: string;
  foxy_foxystage: string;
  stepname: string;
}
