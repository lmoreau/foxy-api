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
    
    const headers = {
      Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
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
