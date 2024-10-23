import { Product } from '../types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7071/api';

export const fetchProducts = async (search: string): Promise<Product[]> => {
  // Implement the actual API call here
  console.log('Fetching products with search:', search);
  return [];
};

export const getAccountById = async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/getAccountById?id=${id}`);
  return response.data;
};

export const listWirelineResidualRows = async (companyId: string) => {
  const response = await axios.get(`${API_BASE_URL}/listWirelineResidualRows?companyId=${companyId}`);
  return response.data.value;
};

export const listRogersWirelineRecords = async (accountId: string) => {
  const response = await axios.get(`${API_BASE_URL}/listRogersWirelineRecords?accountId=${accountId}`);
  return response.data.value;
};

export const updateAccountWirelineResiduals = async (accountId: string, value: string) => {
  const response = await axios.patch(
    `${API_BASE_URL}/updateAccountWirelineResiduals?accountId=${accountId}`,
    { foxyflow_wirelineresiduals: value }
  );
  return response.data;
};
