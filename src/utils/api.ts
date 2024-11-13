import { Product } from '../types';
import { IncomingWirelinePayment } from '../types/wirelinePayments';
import axios, { AxiosError } from 'axios';
import { getDynamicsAccessToken } from '../auth/authService';

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:7071/api';
const DATAVERSE_URL = 'https://foxy.crm3.dynamics.com';

const getAuthHeaders = async () => {
  try {
    const token = await getDynamicsAccessToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    return {
      Authorization: bearerToken,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };
  } catch (error) {
    throw error;
  }
};

export const createQuoteRequest = async (data: any) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequests`;
    
    const requestBody = {
      ...(data._foxy_account_value && {
        "foxy_Account@odata.bind": `/accounts(${data._foxy_account_value})`
      }),
      ...(data._foxy_opportunity_value && {
        "foxy_Opportunity@odata.bind": `/opportunities(${data._foxy_opportunity_value})`
      })
    };

    const response = await axios.post(url, requestBody, { headers });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to create quote request:', err.response?.data);
    throw error;
  }
};

export const createQuoteLineItem = async (data: {
  _foxy_foxyquoterequestlocation_value: string;
  _foxy_product_value: string;
  foxy_quantity?: number;
  foxy_each?: number;
  foxy_mrr?: number;
  foxy_linetcv?: number;
  foxy_term?: number;
  foxy_revenuetype?: number;
  foxy_renewaltype?: string;
  foxy_renewaldate?: string;
  foxy_existingqty?: number;
  foxy_existingmrr?: number;
}) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/createQuoteLineItem`;
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to create quote line item:', err.response?.data);
    throw error;
  }
};

export const updateQuoteLineItem = async (id: string, foxy_comment: string) => {
  try {
    const headers = await getAuthHeaders();
    const formattedId = id.replace(/[{}]/g, '');
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequestlineitems(${formattedId})`;
    
    await axios.patch(url, { foxy_comment }, { headers });
    return { message: "Successfully updated quote line item" };
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to update quote line item:', err.response?.data);
    throw error;
  }
};

export const listIncomingWirelinePayments = async (
  showAll: boolean = false,
  startDate?: string,
  endDate?: string
): Promise<IncomingWirelinePayment[]> => {
  const headers = await getAuthHeaders();
  let url = `${API_BASE_URL}/listIncomingWirelinePayments`;
  
  const params = new URLSearchParams();
  if (showAll) {
    params.append('showAll', 'true');
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  const response = await axios.get(url, { headers });
  return response.data.value;
};

export const fetchProducts = async (filter?: string): Promise<Product[]> => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listProductByRow${filter ? `?$filter=${encodeURIComponent(filter)}` : ''}`;
  const response = await axios.get(url, { headers });
  return response.data.value || [];
};

export const getAccountById = async (id: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/getAccountById?id=${id}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const getQuoteRequestById = async (id: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/getQuoteRequestById?id=${id}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching quote request:', error.response?.data);
    }
    throw error;
  }
};

export const listQuoteLocationRows = async (id: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listQuoteLocationRows?id=${id}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const listQuoteLineItemByRow = async (locationId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listQuoteLineItemByRow?id=${locationId}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const listWirelineResidualRows = async (companyId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listWirelineResidualRows?companyId=${companyId}`;
  const response = await axios.get(url, { headers });
  return response.data.value;
};

export const listMasterResidualRows = async () => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listMasterResidualRows`;
  const response = await axios.get(url, { headers });
  return response.data.value;
};

export const listMasterResidualBillingRows = async (ban?: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listMasterResidualBillingRows${ban ? `?ban=${encodeURIComponent(ban)}` : ''}`;
  const response = await axios.get(url, { headers });
  return response.data.value;
};

export const listRogersWirelineRecords = async (accountId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listRogersWirelineRecords?accountId=${accountId}`;
  const response = await axios.get(url, { headers });
  return response.data.value;
};

export const listResidualAuditByRows = async (accountId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listResidualAuditByRows?accountId=${accountId}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

let cachedAccounts: any = null;

export const listAccountsForResidualCheck = async () => {
  if (cachedAccounts) {
    return cachedAccounts;
  }

  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listAccountsForResidualCheck`;
  const response = await axios.get(url, { headers });
  cachedAccounts = response.data;
  return response.data;
};

export const listWonServices = async (startDate: string, endDate: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listWonServices?startDate=${startDate}&endDate=${endDate}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const listWonServicesForComp = async (sfdcOppID: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listWonServicesForComp?sfdcOppID=${encodeURIComponent(sfdcOppID)}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const updateAccountWirelineResiduals = async (accountId: string, value: string) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/updateAccountWirelineResiduals?accountId=${accountId}`;
    const response = await axios.patch(
      url,
      { foxyflow_wirelineresiduals: value },
      { headers }
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to update wireline residuals:', err.response?.data);
    throw error;
  }
};

interface UpdateWonServiceParams {
  id: string;
  expectedComp?: number;
  paymentStatus?: number;
  foxyflow_internalnotes?: string | null;
  foxyflow_claimnotes?: string;
}

export const updateWonService = async ({ id, expectedComp, paymentStatus, foxyflow_internalnotes, foxyflow_claimnotes }: UpdateWonServiceParams) => {
  try {
    const headers = await getAuthHeaders();
    const formattedId = id.replace(/[{}]/g, '');
    const url = `${API_BASE_URL}/updateWonService`;
    
    const updateData: any = {
      id: formattedId
    };
    
    if (expectedComp !== undefined) {
      updateData.foxy_expectedcomp = expectedComp;
      updateData.crc9f_expectedcompbreakdown = `Manually overridden to ${expectedComp}`;
    }
    
    if (paymentStatus !== undefined) {
      updateData.foxy_inpaymentstatus = paymentStatus;
    }

    if (foxyflow_internalnotes !== undefined) {
      updateData.foxyflow_internalnotes = foxyflow_internalnotes;
    }

    if (foxyflow_claimnotes !== undefined) {
      updateData.foxyflow_claimnotes = foxyflow_claimnotes;
    }
    
    console.log('Making PATCH request to:', url);
    console.log('Update data:', updateData);
    console.log('Request headers:', {
      ...headers,
      Authorization: headers.Authorization ? 'Bearer [redacted]' : 'undefined'
    });
    
    const response = await axios.patch(url, updateData, { headers });
    console.log('Update successful:', response.status);
    return { message: "Successfully updated won service" };
  } catch (error) {
    console.error('Failed to update won service. Error:', error);
    if (error instanceof AxiosError) {
      console.error('API Error details:', error.response?.data);
    }
    throw error;
  }
};

export const updateIncomingPayment = async (paymentId: string, wonServiceId: string | null) => {
  try {
    const headers = await getAuthHeaders();
    const formattedPaymentId = paymentId.replace(/[{}]/g, '');
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_incomingpayments(${formattedPaymentId})`;
    
    const updateData = wonServiceId 
      ? { "foxy_WonService@odata.bind": `/foxy_wonservices(${wonServiceId})` }
      : { "foxy_WonService@odata.bind": null };
    
    await axios.patch(url, updateData, { headers });
    return { message: wonServiceId ? "Successfully mapped payment to service" : "Successfully unlinked payment from service" };
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to update incoming payment:', err.response?.data);
    throw error;
  }
};

export const calculateWonServicesComp = async (ids: string[]) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/calculateWonServicesComp`;
    const response = await axios.post(
      url,
      { ids },
      { headers }
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to calculate compensation:', err.response?.data);
    throw error;
  }
};

export const createResidualScrubAudit = async (accountId: string, status: string, note?: string) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/createCrc9fResidualScrubAudit`;
    const response = await axios.post(
      url,
      { accountId, status, note },
      { headers }
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to create residual scrub audit:', err.response?.data);
    throw error;
  }
};

export const listAccountLocationRows = async (accountId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listAccountLocationRows?accountId=${accountId}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const createFoxyQuoteRequestLocation = async (buildingId: string, quoteRequestId: string, accountLocationId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/createFoxyQuoteRequestLocation`;
  
  const requestBody = {
    "_foxy_building_value": buildingId,
    "_foxy_quoterequest_value": quoteRequestId,
    "_foxy_accountlocation_value": accountLocationId
  };
  
  const response = await axios.post(url, requestBody, { headers });
  return response.data;
};

export const deleteQuoteLocation = async (locationId: string): Promise<void> => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/deleteQuoteLocation?id=${locationId}`;
  await axios.delete(url, { headers });
};

export const listOpportunityRows = async (accountId: string) => {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listOpportunityRows?accountId=${accountId}`;
    const response = await axios.get(url, { headers });
    return response.data;
};

export const listIncomingWirelinePaymentsByWonService = async (wonServiceId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listIncomingWirelinePaymentsByWonService?wonServiceID=${wonServiceId}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const recalculateWonServicePayments = async (wonServiceId: string) => {
  try {
    const headers = await getAuthHeaders();
    const formattedId = wonServiceId.replace(/[{}]/g, '');
    
    const url = `${DATAVERSE_URL}/api/data/v9.2/CalculateRollupField(Target=@p1,FieldName=@p2)?` +
      `@p1={'@odata.id':'foxy_wonservices(${formattedId})'}&` +
      `@p2='foxy_totalinpayments'`;
    
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to recalculate won service payments:', err.response?.data);
    throw error;
  }
};

export const updateQuoteRequest = async (id: string, data: any) => {
  try {
    const headers = await getAuthHeaders();
    const formattedId = id.replace(/[{}]/g, '');
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequests(${formattedId})`;
    
    const response = await axios.patch(url, data, { headers });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to update quote request:', err.response?.data);
    throw error;
  }
};

export const deleteQuoteLineItem = async (id: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/deleteQuoteLineItem?id=${id}`;
    await axios.delete(url, { headers });
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to delete quote line item:', err.response?.data);
    throw error;
  }
};
