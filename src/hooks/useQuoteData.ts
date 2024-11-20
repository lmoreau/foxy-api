import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { QuoteLocation, QuoteLineItem } from '../types';
import { getQuoteRequestById, listQuoteLocationRows, listQuoteLineItemByRow } from '../utils/api';

// Add performance measurement utilities
const now = () => performance.now();
const formatDuration = (start: number, end: number) => `${(end - start).toFixed(2)}ms`;

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
    if (!id || !/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(id)) {
      setState(prev => ({ ...prev, error: 'Invalid quote ID. Please provide a valid GUID.', loading: false }));
      return;
    }

    try {
      // Fetch quote request data
      const quoteRequestData = await getQuoteRequestById(id);

      if (!quoteRequestData?.foxy_Account) {
        setState(prev => ({
          ...prev,
          error: 'Quote data is incomplete or malformed',
          loading: false
        }));
        return;
      }

      // Fetch locations
      const locationsResponse = await listQuoteLocationRows(id);
      const locations = locationsResponse.value || [];

      // Fetch line items for each location
      const lineItemsMap: { [key: string]: QuoteLineItem[] } = {};
      for (const location of locations) {
        try {
          const lineItemsResponse = await listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = lineItemsResponse.value || [];
        } catch (error) {
          message.error(`Failed to load line items for location ${location.foxy_locationid}`);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = [];
        }
      }

      // Update state
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
    if (!id) return;

    try {
      const locationsResponse = await listQuoteLocationRows(id);
      const locations = locationsResponse.value || [];

      const lineItemsMap: { [key: string]: QuoteLineItem[] } = {};
      for (const location of locations) {
        try {
          const lineItemsResponse = await listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = lineItemsResponse.value || [];
        } catch (error) {
          message.error(`Failed to load line items for location ${location.foxy_locationid}`);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = [];
        }
      }

      setLineItems(lineItemsMap);
      setState(prev => ({
        ...prev,
        locations,
        rawQuoteData: {
          ...prev.rawQuoteData,
          locations,
          lineItems: lineItemsMap
        }
      }));
    } catch (error) {
      console.error('[useQuoteData] Error in refetchLocations:', error);
      message.error('Failed to refresh locations');
    }
  }, [id]);

  const refetch = useCallback(async () => {
    if (!id) return;
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const quoteData = await getQuoteRequestById(id);

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
    } catch (error) {
      console.error('[useQuoteData] Error in refetch:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to refetch quote data',
        loading: false
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, id]);

  if (!id) {
    return {
      accountName: '',
      accountId: '',
      quoteId: '',
      locations: [],
      lineItems: {},
      error: 'No ID provided',
      loading: false,
      owninguser: undefined,
      rawQuoteData: {
        lineItems: {},
        locations: [],
        quoteRequest: {}
      },
      refetchLocations,
      setLineItems,
      refetch
    };
  }

  return {
    ...state,
    lineItems,
    refetchLocations,
    setLineItems,
    refetch
  };
};
