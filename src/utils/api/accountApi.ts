import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from './config';

export const getAccountById = async (id: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/getAccountById?id=${id}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const listAccountLocationRows = async (accountId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listAccountLocationRows?accountId=${accountId}`;
  const response = await axios.get(url, { headers });
  return response.data;
};

export const listOpportunityRows = async (accountId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listOpportunityRows?accountId=${accountId}`;
  const response = await axios.get(url, { headers });
  return response.data;
};
