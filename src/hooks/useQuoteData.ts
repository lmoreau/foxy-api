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

interface QuoteData {
  accountName: string;
  accountId: string;
  quoteId: string;
  locations: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  error: string | null;
  loading: boolean;
  refetchLocations: () => Promise<void>;
  owninguser?: OwningUser;
  rawQuoteData: {
    lineItems: { [key: string]: QuoteLineItem[] };
    locations: QuoteLocation[];
    quoteRequest: any;
  };
}

export const useQuoteData = (id: string | undefined): QuoteData => {
  const [quoteData, setQuoteData] = useState<QuoteData>({
    accountName: '',
    accountId: '',
    quoteId: '',
    locations: [],
    lineItems: {},
    error: null,
    loading: true,
    refetchLocations: async () => {},
    rawQuoteData: {
      lineItems: {},
      locations: [],
      quoteRequest: {}
    }
  });

  const fetchData = useCallback(async () => {
    if (!id || !/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(id)) {
      setQuoteData(prev => ({ ...prev, error: 'Invalid quote ID. Please provide a valid GUID.', loading: false }));
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

      setQuoteData(prev => ({
        ...prev,
        accountName: quoteRequestData.foxy_Account.name,
        accountId: quoteRequestData.foxy_Account.accountid,
        quoteId: quoteRequestData.foxy_quoteid,
        locations,
        lineItems: lineItemsMap,
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
      setQuoteData(prev => ({ ...prev, error: errorMessage, loading: false }));
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

      setQuoteData(prev => ({
        ...prev,
        locations,
        lineItems: lineItemsMap,
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
      setQuoteData(prev => ({ ...prev, error: errorMessage }));
    }
  }, [id]);

  useEffect(() => {
    setQuoteData(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [fetchData]);

  return { ...quoteData, refetchLocations };
};
