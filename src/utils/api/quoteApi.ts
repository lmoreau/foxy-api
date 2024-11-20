import axios, { AxiosError } from 'axios';
import { API_BASE_URL, DATAVERSE_URL, getAuthHeaders, now, formatDuration, requestTimeTracker } from './config';
import { Product } from '../../types';

// Quote Request Operations
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
      }),
      ...(data.foxy_subject && {
        foxy_subject: data.foxy_subject
      }),
      ...(data.foxy_quotetype !== undefined && {
        foxy_quotetype: data.foxy_quotetype
      })
    };

    console.log('Creating quote request with:', requestBody);
    const response = await axios.post(url, requestBody, { headers });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to create quote request:', err.response?.data);
    throw error;
  }
};

export const getQuoteRequestById = async (id: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/getQuoteRequestById?id=${id}`;

  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[API] Error details:', error.response?.data);
    }
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

export const listQuoteRequests = async (stages: number[]) => {
    const headers = await getAuthHeaders();
    const stagesQuery = stages.map(stage => `foxy_quotestage eq ${stage}`).join(' or ');
    const url = `${API_BASE_URL}/listQuoteRequests?stages=${encodeURIComponent(stagesQuery)}`;
    const response = await axios.get(url, { headers });
    return response.data;
};

// Quote Location Operations
export const listQuoteLocationRows = async (id: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listQuoteLocationRows?id=${id}`;
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

// Quote Line Item Operations
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

export const updateQuoteLineItem = async (data: { id: string; [key: string]: any }) => {
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/updateQuoteLineItem`;
    
    const response = await axios.patch(url, data, { headers });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('Failed to update quote line item:', err.response?.data);
    throw error;
  }
};

export const listQuoteLineItemByRow = async (locationId: string) => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listQuoteLineItemByRow?id=${locationId}`;
  const response = await axios.get(url, { headers });
  return response.data;
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

// Product Operations
export const fetchProducts = async (filter?: string): Promise<Product[]> => {
  const headers = await getAuthHeaders();
  const url = `${API_BASE_URL}/listProductByRow${filter ? `?$filter=${encodeURIComponent(filter)}` : ''}`;
  const response = await axios.get(url, { headers });
  return response.data.value || [];
};
