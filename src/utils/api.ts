import { Product } from '../types';
import axios from 'axios';
import { getAccessToken } from '../auth/authService';

const API_BASE_URL = 'http://localhost:7071/api';

const getAuthHeaders = async () => {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchProducts = async (search: string): Promise<Product[]> => {
  // Implement the actual API call here
  console.log('Fetching products with search:', search);
  return [];
};

export const getAccountById = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/getAccountById?id=${id}`, { headers });
  return response.data;
};

export const listWirelineResidualRows = async (companyId: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/listWirelineResidualRows?companyId=${companyId}`, { headers });
  return response.data.value;
};

export const listRogersWirelineRecords = async (accountId: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/listRogersWirelineRecords?accountId=${accountId}`, { headers });
  return response.data.value;
};

export const updateAccountWirelineResiduals = async (accountId: string, value: string) => {
  const headers = await getAuthHeaders();
  const response = await axios.patch(
    `${API_BASE_URL}/updateAccountWirelineResiduals?accountId=${accountId}`,
    { foxyflow_wirelineresiduals: value },
    { headers }
  );
  return response.data;
};
