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
      // Get quote request data
      const quoteRequestData = await getQuoteRequestById(id);

      // Get locations
      const locationsResponse = await listQuoteLocationRows(id);
      const locations = locationsResponse.value || [];

      // Get line items for each location sequentially instead of in parallel
      const lineItemsMap: { [key: string]: QuoteLineItem[] } = {};
      for (const location of locations) {
        try {
          const lineItemsResponse = await listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = lineItemsResponse.value || [];
        } catch (error) {
          console.error(`Error fetching line items for location ${location.foxy_foxyquoterequestlocationid}:`, error);
          message.error(`Failed to load line items for location ${location.foxy_locationid}`);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = [];
        }
      }

      setLineItems(lineItemsMap);
      setState(prev => ({
        ...prev,
        accountName: quoteRequestData.foxy_Account.name,
        accountId: quoteRequestData.foxy_Account.accountid,
        quoteId: quoteRequestData.foxy_quoteid,
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
      console.error('Error fetching data:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [id]);

  const refetchLocations = useCallback(async () => {
    if (!id) return;

    try {
      const locationsResponse = await listQuoteLocationRows(id);
      const locations = locationsResponse.value || [];

      // Get line items for each location sequentially
      const lineItemsMap: { [key: string]: QuoteLineItem[] } = {};
      for (const location of locations) {
        try {
          const lineItemsResponse = await listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = lineItemsResponse.value || [];
        } catch (error) {
          console.error(`Error fetching line items for location ${location.foxy_foxyquoterequestlocationid}:`, error);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = [];
        }
      }

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
    } catch (error) {
      console.error('Error refetching locations:', error);
      let errorMessage = 'An unknown error occurred while refetching locations';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, [id]);

  const refetch = async () => {
    if (!id) return;
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const quoteData = await getQuoteRequestById(id);
      setState(prev => ({
        ...prev,
        loading: false,
        accountName: quoteData.foxy_Account.name,
        accountId: quoteData.foxy_Account.accountid,
        quoteId: quoteData.foxy_quoteid,
        owninguser: quoteData.owninguser,
        rawQuoteData: {
          ...prev.rawQuoteData,
          quoteRequest: quoteData
        }
      }));
    } catch (error) {
      console.error('Error refetching data:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  };

  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    lineItems,
    setLineItems,
    refetchLocations,
    refetch
  };
};
