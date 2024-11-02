import { Product } from '../types';
import axios, { AxiosError } from 'axios';
import { getAccessToken } from '../auth/authService';

const API_BASE_URL = 'http://localhost:7071/api';
const DATAVERSE_URL = 'https://foxy.crm3.dynamics.com';

const getAuthHeaders = async () => {
  try {
    const token = await getAccessToken();
    
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

export const fetchProducts = async (search: string): Promise<Product[]> => {
  return [];
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
}

export const updateWonService = async ({ id, expectedComp, paymentStatus }: UpdateWonServiceParams) => {
  try {
    const headers = await getAuthHeaders();
    const formattedId = id.replace(/[{}]/g, '');
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_wonservices(${formattedId})`;
    
    const updateData: any = {};
    
    if (expectedComp !== undefined) {
      updateData.foxy_expectedcomp = expectedComp;
      updateData.crc9f_expectedcompbreakdown = `Manually overridden to ${expectedComp}`;
    }
    
    if (paymentStatus !== undefined) {
      updateData.foxy_inpaymentstatus = paymentStatus;
    }
    
    await axios.patch(url, updateData, { headers });
    return { message: "Successfully updated won service" };
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to update won service:', err.response?.data);
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
