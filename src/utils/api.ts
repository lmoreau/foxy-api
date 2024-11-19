import { Product } from '../types';
import { IncomingWirelinePayment } from '../types/wirelinePayments';
import axios, { AxiosError } from 'axios';
import { getDynamicsAccessToken } from '../auth/authService';

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:7071/api';
const DATAVERSE_URL = 'https://foxy.crm3.dynamics.com';

const getAuthHeaders = async () => {
  console.log('[API] Getting auth headers, API_BASE_URL:', API_BASE_URL, 'DATAVERSE_URL:', DATAVERSE_URL);
  try {
    const token = await getDynamicsAccessToken();
    console.log('[API] Token obtained:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    
    if (!token) {
      console.error('[API] No token available');
      throw new Error('No authentication token available');
    }
    
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    console.log('[API] Bearer token format correct:', bearerToken.startsWith('Bearer '));
    
    const headers = {
      Authorization: bearerToken,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };
    
    console.log('[API] Headers prepared:', Object.keys(headers).join(', '));
    return headers;
  } catch (error) {
    console.error('[API] Auth header error:', error);
    throw error;
  }
};

export const createQuoteRequest = async (data: any) => {
  console.log('[API] Creating quote request with data:', data);
  try {
    const headers = await getAuthHeaders();
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequests`;
    console.log('[API] Request URL:', url);
    
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
    console.log('[API] Making request...');
    const response = await axios.post(url, requestBody, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote request error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
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
  console.log('[API] Creating quote line item with data:', data);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/createQuoteLineItem`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.post(url, data, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote line item error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const updateQuoteLineItem = async (data: { id: string; [key: string]: any }) => {
  console.log('[API] Updating quote line item with data:', data);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/updateQuoteLineItem`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.patch(url, data, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote line item error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listIncomingWirelinePayments = async (
  showAll: boolean = false,
  startDate?: string,
  endDate?: string
): Promise<IncomingWirelinePayment[]> => {
  console.log('[API] Listing incoming wireline payments with params:', { showAll, startDate, endDate });
  try {
    const headers = await getAuthHeaders();
    let url = `${API_BASE_URL}/listIncomingWirelinePayments`;
    console.log('[API] Request URL:', url);
    
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
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data.value;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Incoming wireline payments error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const fetchProducts = async (filter?: string): Promise<Product[]> => {
  console.log('[API] Fetching products with filter:', filter);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listProductByRow${filter ? `?$filter=${encodeURIComponent(filter)}` : ''}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data.value || [];
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Products error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const getAccountById = async (id: string) => {
  console.log('[API] Fetching account by id:', id);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/getAccountById?id=${id}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Account error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const getQuoteRequestById = async (id: string) => {
  console.log('[API] Fetching quote request:', id);
  try {
    const headers = await getAuthHeaders();
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequests(${id})?$expand=foxy_Account`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote request error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listQuoteLocationRows = async (id: string) => {
  console.log('[API] Fetching quote locations for quote:', id);
  try {
    const headers = await getAuthHeaders();
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequestlocations?$filter=_foxy_foxyquoterequest_value eq ${id}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote locations error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listQuoteLineItemByRow = async (locationId: string) => {
  console.log('[API] Fetching line items for location:', locationId);
  try {
    const headers = await getAuthHeaders();
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequestlineitems?$filter=_foxy_foxyquoterequestlocation_value eq '${locationId}'`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Line items error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listRogersWirelineRecords = async (accountId: string) => {
  console.log('[API] Listing Rogers wireline records with account id:', accountId);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listRogersWirelineRecords?accountId=${accountId}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data.value;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Rogers wireline records error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listWonServices = async (startDate: string, endDate: string) => {
  console.log('[API] Listing won services with start date:', startDate, 'and end date:', endDate);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listWonServices?startDate=${startDate}&endDate=${endDate}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Won services error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listWonServicesForComp = async (sfdcOppID: string) => {
  console.log('[API] Listing won services for comp with sfdc opp id:', sfdcOppID);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listWonServicesForComp?sfdcOppID=${encodeURIComponent(sfdcOppID)}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Won services for comp error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const updateAccountWirelineResiduals = async (accountId: string, value: string) => {
  console.log('[API] Updating account wireline residuals with account id:', accountId, 'and value:', value);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/updateAccountWirelineResiduals?accountId=${accountId}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.patch(
      url,
      { foxyflow_wirelineresiduals: value },
      { headers }
    );
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Account wireline residuals error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const updateIncomingPayment = async (paymentId: string, wonServiceId: string | null) => {
  console.log('[API] Updating incoming payment with payment id:', paymentId, 'and won service id:', wonServiceId);
  try {
    const headers = await getAuthHeaders();
    const formattedPaymentId = paymentId.replace(/[{}]/g, '');
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_incomingpayments(${formattedPaymentId})`;
    console.log('[API] Request URL:', url);
    
    const updateData = wonServiceId 
      ? { "foxy_WonService@odata.bind": `/foxy_wonservices(${wonServiceId})` }
      : { "foxy_WonService@odata.bind": null };
    
    console.log('[API] Making request...');
    await axios.patch(url, updateData, { headers });
    console.log('[API] Response type:', typeof updateData);
    console.log('[API] Response data:', JSON.stringify(updateData, null, 2));
    
    return { message: wonServiceId ? "Successfully mapped payment to service" : "Successfully unlinked payment from service" };
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Incoming payment error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const calculateWonServicesComp = async (ids: string[]) => {
  console.log('[API] Calculating won services comp with ids:', ids);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/calculateWonServicesComp`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.post(
      url,
      { ids },
      { headers }
    );
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Won services comp error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listAccountLocationRows = async (accountId: string) => {
  console.log('[API] Listing account location rows with account id:', accountId);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listAccountLocationRows?accountId=${accountId}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Account location rows error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const createFoxyQuoteRequestLocation = async (buildingId: string, quoteRequestId: string, accountLocationId: string) => {
  console.log('[API] Creating Foxy quote request location with building id:', buildingId, 'quote request id:', quoteRequestId, 'and account location id:', accountLocationId);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/createFoxyQuoteRequestLocation`;
    console.log('[API] Request URL:', url);
    
    const requestBody = {
      "_foxy_building_value": buildingId,
      "_foxy_quoterequest_value": quoteRequestId,
      "_foxy_accountlocation_value": accountLocationId
    };
    
    console.log('[API] Making request...');
    const response = await axios.post(url, requestBody, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Foxy quote request location error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const deleteQuoteLocation = async (locationId: string): Promise<void> => {
  console.log('[API] Deleting quote location with location id:', locationId);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/deleteQuoteLocation?id=${locationId}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    await axios.delete(url, { headers });
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote location error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listOpportunityRows = async (accountId: string) => {
  console.log('[API] Listing opportunity rows with account id:', accountId);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listOpportunityRows?accountId=${accountId}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Opportunity rows error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listIncomingWirelinePaymentsByWonService = async (wonServiceId: string) => {
  console.log('[API] Listing incoming wireline payments by won service with won service id:', wonServiceId);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/listIncomingWirelinePaymentsByWonService?wonServiceID=${wonServiceId}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Incoming wireline payments by won service error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const updateQuoteRequest = async (id: string, data: any) => {
  console.log('[API] Updating quote request with id:', id, 'and data:', data);
  try {
    const headers = await getAuthHeaders();
    const formattedId = id.replace(/[{}]/g, '');
    const url = `${DATAVERSE_URL}/api/data/v9.2/foxy_foxyquoterequests(${formattedId})`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.patch(url, data, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote request error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const deleteQuoteLineItem = async (id: string): Promise<void> => {
  console.log('[API] Deleting quote line item with id:', id);
  try {
    const headers = await getAuthHeaders();
    const url = `${API_BASE_URL}/deleteQuoteLineItem?id=${id}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    await axios.delete(url, { headers });
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote line item error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};

export const listQuoteRequests = async (stages: number[]) => {
  console.log('[API] Listing quote requests with stages:', stages);
  try {
    const headers = await getAuthHeaders();
    const stagesQuery = stages.map(stage => `foxy_quotestage eq ${stage}`).join(' or ');
    const url = `${API_BASE_URL}/listQuoteRequests?stages=${encodeURIComponent(stagesQuery)}`;
    console.log('[API] Request URL:', url);
    
    console.log('[API] Making request...');
    const response = await axios.get(url, { headers });
    console.log('[API] Response status:', response.status);
    console.log('[API] Response headers:', response.headers);
    console.log('[API] Response type:', typeof response.data);
    console.log('[API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('[API] Quote requests error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      headers: err.response?.headers,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        headers: err.config?.headers
      }
    });
    throw error;
  }
};
