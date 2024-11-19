import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { QuoteLocation, QuoteLineItem } from '../types';
import { getQuoteRequestById, listQuoteLocationRows, listQuoteLineItemByRow } from '../utils/api';

interface OwningUser {
  fullname: string;
  internalemailaddress: string;
  systemuserid: string;
  ownerid: string;
}

export interface QuoteDataState {
  accountName: string;
  accountId: string;
  quoteId: string;
  locations: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  error: string | null;
  loading: boolean;
  owninguser: OwningUser | undefined;
  rawQuoteData: {
    lineItems: { [key: string]: QuoteLineItem[] };
    locations: QuoteLocation[];
    quoteRequest: any;
  };
}

export interface QuoteDataReturn extends QuoteDataState {
  refetchLocations: () => Promise<void>;
  setLineItems: React.Dispatch<React.SetStateAction<{ [key: string]: QuoteLineItem[] }>>;
  refetch: () => Promise<void>;
}

export const useQuoteData = (id: string | undefined): QuoteDataReturn => {
  console.log('[useQuoteData] Hook initialized with ID:', id);
  console.log('[useQuoteData] Environment:', process.env.NODE_ENV);
  console.log('[useQuoteData] API endpoint:', process.env.REACT_APP_API_ENDPOINT);
  
  const [lineItems, setLineItems] = useState<{ [key: string]: QuoteLineItem[] }>({});
  const [state, setState] = useState<QuoteDataState>({
    accountName: '',
    accountId: '',
    quoteId: '',
    locations: [],
    lineItems: {},
    error: null,
    loading: true,
    owninguser: undefined,
    rawQuoteData: {
      lineItems: {},
      locations: [],
      quoteRequest: {}
    }
  });

  const fetchData = useCallback(async () => {
    console.log('[useQuoteData] Starting fetchData');
    
    if (!id || !/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(id)) {
      console.error('[useQuoteData] Invalid quote ID:', id);
      setState(prev => ({ ...prev, error: 'Invalid quote ID. Please provide a valid GUID.', loading: false }));
      return;
    }

    try {
      console.log('[useQuoteData] Fetching quote request data for ID:', id);
      const quoteRequestData = await getQuoteRequestById(id);
      console.log('[useQuoteData] Quote request data received:', quoteRequestData);

      if (!quoteRequestData?.foxy_Account) {
        console.error('[useQuoteData] Missing foxy_Account in quote request data:', quoteRequestData);
        setState(prev => ({
          ...prev,
          error: 'Quote data is incomplete or malformed',
          loading: false
        }));
        return;
      }

      console.log('[useQuoteData] Fetching locations');
      const locationsResponse = await listQuoteLocationRows(id);
      const locations = locationsResponse.value || [];
      console.log('[useQuoteData] Locations fetched:', locations.length);

      console.log('[useQuoteData] Fetching line items for each location');
      const lineItemsMap: { [key: string]: QuoteLineItem[] } = {};
      for (const location of locations) {
        try {
          console.log('[useQuoteData] Fetching line items for location:', location.foxy_foxyquoterequestlocationid);
          const lineItemsResponse = await listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = lineItemsResponse.value || [];
          console.log('[useQuoteData] Line items fetched for location:', {
            locationId: location.foxy_foxyquoterequestlocationid,
            count: lineItemsResponse.value?.length || 0
          });
        } catch (error) {
          console.error('[useQuoteData] Error fetching line items:', error);
          message.error(`Failed to load line items for location ${location.foxy_locationid}`);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = [];
        }
      }

      console.log('[useQuoteData] Updating state with fetched data');
      setLineItems(lineItemsMap);
      setState(prev => ({
        ...prev,
        accountName: quoteRequestData.foxy_Account?.name || 'Unknown Account',
        accountId: quoteRequestData.foxy_Account?.accountid || '',
        quoteId: quoteRequestData.foxy_quoteid || '',
        locations,
        error: null,
        loading: false,
        owninguser: quoteRequestData.owninguser,
        rawQuoteData: {
          lineItems: lineItemsMap,
          locations,
          quoteRequest: quoteRequestData
        }
      }));
      console.log('[useQuoteData] State updated successfully');
    } catch (error) {
      console.error('[useQuoteData] Error in fetchData:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load quote data',
        loading: false
      }));
    }
  }, [id]);

  const refetchLocations = useCallback(async () => {
    console.log('[useQuoteData] Starting refetchLocations with ID:', id);
    if (!id) return;

    try {
      console.log('[useQuoteData] Refetching locations');
      const locationsResponse = await listQuoteLocationRows(id);
      const locations = locationsResponse.value || [];
      console.log('[useQuoteData] Locations refetched:', locations.length);

      console.log('[useQuoteData] Refetching line items for each location');
      const lineItemsMap: { [key: string]: QuoteLineItem[] } = {};
      for (const location of locations) {
        try {
          console.log('[useQuoteData] Refetching line items for location:', location.foxy_foxyquoterequestlocationid);
          const lineItemsResponse = await listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = lineItemsResponse.value || [];
          console.log('[useQuoteData] Line items refetched for location:', {
            locationId: location.foxy_foxyquoterequestlocationid,
            count: lineItemsResponse.value?.length || 0
          });
        } catch (error) {
          console.error('[useQuoteData] Error refetching line items:', error);
          message.error(`Failed to load line items for location ${location.foxy_locationid}`);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = [];
        }
      }

      console.log('[useQuoteData] Updating state with refetched data');
      setLineItems(lineItemsMap);
      setState(prev => ({
        ...prev,
        locations,
        error: null,
        rawQuoteData: {
          lineItems: lineItemsMap,
          locations,
          quoteRequest: prev.rawQuoteData.quoteRequest
        }
      }));
      console.log('[useQuoteData] State updated successfully');
    } catch (error) {
      console.error('[useQuoteData] Error in refetchLocations:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to refetch locations',
      }));
    }
  }, [id]);

  const refetch = async () => {
    console.log('[useQuoteData] Starting refetch with ID:', id);
    if (!id) return;
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      console.log('[useQuoteData] Refetching quote request data');
      const quoteData = await getQuoteRequestById(id);
      console.log('[useQuoteData] Quote request data refetched:', quoteData);

      setState(prev => ({
        ...prev,
        loading: false,
        accountName: quoteData.foxy_Account?.name || 'Unknown Account',
        accountId: quoteData.foxy_Account?.accountid || '',
        quoteId: quoteData.foxy_quoteid || '',
        owninguser: quoteData.owninguser,
        rawQuoteData: {
          ...prev.rawQuoteData,
          quoteRequest: quoteData
        }
      }));
      console.log('[useQuoteData] State updated successfully');
    } catch (error) {
      console.error('[useQuoteData] Error in refetch:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to refetch quote data',
        loading: false
      }));
    }
  };

  useEffect(() => {
    console.log('[useQuoteData] Starting useEffect with ID:', id);
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [fetchData, id]);

  return {
    ...state,
    lineItems,
    setLineItems,
    refetchLocations,
    refetch
  };
};
