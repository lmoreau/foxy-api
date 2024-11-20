import axios, { AxiosError } from 'axios';
import { API_BASE_URL, DATAVERSE_URL, getAuthHeaders } from './config';
import { Product } from '../../types';

// Performance measurement utilities
const _now = () => performance.now();
const _formatDuration = (start: number, end: number) => `${(end - start).toFixed(2)}ms`;

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

    console.log('[API] Creating quote request with:', requestBody);
    const response = await axios.post(url, requestBody, { headers });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Failed to create quote request:', err.response?.data);
    throw error;
  }
};

export const getQuoteRequestById = async (id: string) => {
  const startTime = _now();
  console.log(`[API] Starting getQuoteRequestById for ID: ${id}`);
  
  try {
    const authStartTime = _now();
    const headers = await getAuthHeaders();
    console.log(`[API] Auth headers obtained in ${_formatDuration(authStartTime, _now())}`);

    const url = `${API_BASE_URL}/getQuoteRequestById?id=${id}`;
    console.log(`[API] Fetching quote request from: ${url}`);

    const requestStartTime = _now();
    const response = await axios.get(url, { headers });
    console.log(`[API] Quote request fetch completed in ${_formatDuration(requestStartTime, _now())}`);
    console.log(`[API] Response size: ${JSON.stringify(response.data).length} bytes`);

    const totalTime = _formatDuration(startTime, _now());
    console.log(`[API] Total getQuoteRequestById operation completed in ${totalTime}`);
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[API] getQuoteRequestById error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        duration: _formatDuration(startTime, _now())
      });
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
    console.error('[API] Failed to update quote request:', err.response?.data);
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
  const startTime = _now();
  console.log(`[API] Starting listQuoteLocationRows for ID: ${id}`);

  try {
    const authStartTime = _now();
    const headers = await getAuthHeaders();
    console.log(`[API] Auth headers obtained in ${_formatDuration(authStartTime, _now())}`);

    const url = `${API_BASE_URL}/listQuoteLocationRows?id=${id}`;
    console.log(`[API] Fetching quote locations from: ${url}`);

    const requestStartTime = _now();
    const response = await axios.get(url, { headers });
    console.log(`[API] Quote locations fetch completed in ${_formatDuration(requestStartTime, _now())}`);
    console.log(`[API] Found ${response.data.value?.length || 0} locations`);
    console.log(`[API] Response size: ${JSON.stringify(response.data).length} bytes`);

    const totalTime = _formatDuration(startTime, _now());
    console.log(`[API] Total listQuoteLocationRows operation completed in ${totalTime}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[API] listQuoteLocationRows error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        duration: _formatDuration(startTime, _now())
      });
    }
    throw error;
  }
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
export const listQuoteLineItemByRow = async (locationId: string) => {
  const startTime = _now();
  console.log(`[API] Starting listQuoteLineItemByRow for location ID: ${locationId}`);

  try {
    const authStartTime = _now();
    const headers = await getAuthHeaders();
    console.log(`[API] Auth headers obtained in ${_formatDuration(authStartTime, _now())}`);

    const url = `${API_BASE_URL}/listQuoteLineItemByRow?id=${locationId}`;
    console.log(`[API] Fetching quote line items from: ${url}`);

    const requestStartTime = _now();
    const response = await axios.get(url, { headers });
    console.log(`[API] Quote line items fetch completed in ${_formatDuration(requestStartTime, _now())}`);
    console.log(`[API] Found ${response.data.value?.length || 0} line items for location`);
    console.log(`[API] Response size: ${JSON.stringify(response.data).length} bytes`);

    const totalTime = _formatDuration(startTime, _now());
    console.log(`[API] Total listQuoteLineItemByRow operation completed in ${totalTime}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[API] listQuoteLineItemByRow error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        duration: _formatDuration(startTime, _now())
      });
    }
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
    console.error('[API] Failed to create quote line item:', err.response?.data);
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
    console.error('[API] Failed to update quote line item:', err.response?.data);
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
    console.error('[API] Failed to delete quote line item:', err.response?.data);
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
