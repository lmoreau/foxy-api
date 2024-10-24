import { Product } from '../types';
import axios, { AxiosError } from 'axios';
import { getAccessToken } from '../auth/authService';

const API_BASE_URL = 'http://localhost:7071/api';

const getAuthHeaders = async () => {
  try {
    console.log('=== Getting auth headers ===');
    const token = await getAccessToken();
    
    if (!token) {
      console.error('No token received from getAccessToken');
      throw new Error('No authentication token available');
    }

    console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');
    console.log('Token length:', token.length);
    
    // Always ensure token has 'Bearer ' prefix
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    const headers = {
      Authorization: bearerToken,
      'Content-Type': 'application/json',
    };
    
    console.log('Generated headers:', {
      Authorization: headers.Authorization.substring(0, 20) + '...',
      'Content-Type': headers['Content-Type']
    });

    return headers;
  } catch (error) {
    const err = error as Error;
    console.error('Failed to get auth headers:', {
      error: err.message,
      stack: err.stack,
      name: err.name
    });
    throw error;
  }
};

export const fetchProducts = async (search: string): Promise<Product[]> => {
  console.log('Fetching products with search:', search);
  return [];
};

export const getAccountById = async (id: string) => {
  console.log('=== Getting account by ID ===');
  console.log('Account ID:', id);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/getAccountById?id=${id}`;
  
  console.log('Request URL:', url);
  console.log('Request headers:', {
    Authorization: headers.Authorization.substring(0, 20) + '...',
    'Content-Type': headers['Content-Type']
  });

  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data;
};

export const getQuoteRequestById = async (id: string) => {
  console.log('=== Getting quote request by ID ===');
  console.log('Quote Request ID:', id);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/getQuoteRequestById?id=${id}`;
  
  console.log('Request URL:', url);
  console.log('Request headers:', {
    Authorization: headers.Authorization.substring(0, 20) + '...',
    'Content-Type': headers['Content-Type']
  });

  try {
    const response = await axios.get(url, { headers });
    console.log('Response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('Error fetching quote request:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
    }
    throw error;
  }
};

export const listQuoteLocationRows = async (id: string) => {
  console.log('=== Listing quote location rows ===');
  console.log('Quote ID:', id);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listQuoteLocationRows?id=${id}`;
  
  console.log('Request URL:', url);
  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data;
};

export const listQuoteLineItemByRow = async (locationId: string) => {
  console.log('=== Listing quote line items by row ===');
  console.log('Location ID:', locationId);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listQuoteLineItemByRow?id=${locationId}`;
  
  console.log('Request URL:', url);
  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data;
};

export const listWirelineResidualRows = async (companyId: string) => {
  console.log('=== Listing wireline residual rows ===');
  console.log('Company ID:', companyId);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listWirelineResidualRows?companyId=${companyId}`;
  
  console.log('Request URL:', url);
  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data.value;
};

export const listRogersWirelineRecords = async (accountId: string) => {
  console.log('=== Listing Rogers wireline records ===');
  console.log('Account ID:', accountId);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listRogersWirelineRecords?accountId=${accountId}`;
  
  console.log('Request URL:', url);
  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data.value;
};

export const listResidualAuditByRows = async (accountId: string) => {
  console.log('=== Listing residual audit rows ===');
  console.log('Account ID:', accountId);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listResidualAuditByRows?accountId=${accountId}`;
  
  console.log('Request URL:', url);
  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data;
};

export const listAccountsForResidualCheck = async () => {
  console.log('=== Listing accounts for residual check ===');
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listAccountsForResidualCheck`;
  
  console.log('Request URL:', url);
  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data;
};

export const updateAccountWirelineResiduals = async (accountId: string, value: string) => {
  try {
    console.log('=== Updating account wireline residuals ===');
    console.log('Account ID:', accountId);
    console.log('Value:', value);

    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/updateAccountWirelineResiduals?accountId=${accountId}`;
    
    console.log('Request URL:', url);
    console.log('Request payload:', { foxyflow_wirelineresiduals: value });
    console.log('Request headers:', {
      Authorization: headers.Authorization.substring(0, 20) + '...',
      'Content-Type': headers['Content-Type']
    });

    const response = await axios.patch(
      url,
      { foxyflow_wirelineresiduals: value },
      { headers }
    );

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to update wireline residuals:', {
      error: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers
    });
    throw error;
  }
};

// New authenticated API functions for location management
export const listAccountLocationRows = async (accountId: string) => {
  console.log('=== Listing account location rows ===');
  console.log('Account ID:', accountId);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listAccountLocationRows?accountId=${accountId}`;
  
  console.log('Request URL:', url);
  const response = await axios.get(url, { headers });
  console.log('Response status:', response.status);
  return response.data;
};

export const createFoxyQuoteRequestLocation = async (buildingId: string, quoteRequestId: string, accountLocationId: string) => {
  console.log('=== Creating quote request location ===');
  console.log('Building ID:', buildingId);
  console.log('Quote Request ID:', quoteRequestId);
  console.log('Account Location ID:', accountLocationId);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/createFoxyQuoteRequestLocation`;
  
  // Format the request body according to Dataverse API requirements
  const requestBody = {
    "_foxy_building_value": buildingId,
    "_foxy_quoterequest_value": quoteRequestId,
    "_foxy_accountlocation_value": accountLocationId
  };
  
  console.log('Request URL:', url);
  console.log('Request body:', requestBody);
  
  const response = await axios.post(url, requestBody, { headers });
  console.log('Response status:', response.status);
  return response.data;
};

export const deleteQuoteLocation = async (locationId: string): Promise<void> => {
  console.log('=== Deleting quote location ===');
  console.log('Location ID:', locationId);
  
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/deleteQuoteLocation?id=${locationId}`;
  
  console.log('Request URL:', url);
  await axios.delete(url, { headers });
};

export const listOpportunityRows = async (accountId: string) => {
    console.log('=== Listing opportunity rows ===');
    console.log('Account ID:', accountId);
    
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listOpportunityRows?accountId=${accountId}`;
    
    console.log('Request URL:', url);
    const response = await axios.get(url, { headers });
    console.log('Response status:', response.status);
    return response.data; // Ensure this returns the expected structure
};
