import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { QuoteLocation, QuoteLineItem, QuoteRequest } from '../types';

interface OwningUser {
  fullname: string;
  internalemailaddress: string;
  systemuserid: string;
  ownerid: string;
}

interface QuoteData {
  accountName: string;
  quoteId: string;
  locations: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  error: string | null;
  loading: boolean;
  refetchLocations: () => Promise<void>;
  owninguser?: OwningUser;
}

export const useQuoteData = (id: string | undefined): QuoteData => {
  const [quoteData, setQuoteData] = useState<QuoteData>({
    accountName: '',
    quoteId: '',
    locations: [],
    lineItems: {},
    error: null,
    loading: true,
    refetchLocations: async () => {},
  });

  const fetchData = useCallback(async () => {
    if (!id || !/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(id)) {
      setQuoteData(prev => ({ ...prev, error: 'Invalid quote ID. Please provide a valid GUID.', loading: false }));
      return;
    }

    try {
      const quoteRequestResponse = await axios.get(`http://localhost:7071/api/getQuoteRequestById?id=${id}`);
      const quoteRequestData = quoteRequestResponse.data.value[0] as QuoteRequest;

      const locationsResponse = await axios.get(`http://localhost:7071/api/listQuoteLocationRows?id=${id}`);
      const locations = locationsResponse.data.value || [];

      const lineItemsPromises = locations.map(async (location: QuoteLocation) => {
        try {
          const lineItemsResponse = await axios.get(`http://localhost:7071/api/listQuoteLineItemByRow?id=${location.foxy_foxyquoterequestlocationid}`);
          return { [location.foxy_foxyquoterequestlocationid]: lineItemsResponse.data.value };
        } catch (error) {
          console.error(`Error fetching line items for location ${location.foxy_foxyquoterequestlocationid}:`, error);
          message.error(`Failed to load line items for location ${location.foxy_locationid}`);
          return { [location.foxy_foxyquoterequestlocationid]: [] };
        }
      });

      const lineItemsResults = await Promise.all(lineItemsPromises);
      const lineItemsMap = Object.assign({}, ...lineItemsResults);

      setQuoteData(prev => ({
        ...prev,
        accountName: quoteRequestData.foxy_Account.name,
        quoteId: quoteRequestData.foxy_quoteid,
        locations,
        lineItems: lineItemsMap,
        error: null,
        loading: false,
        owninguser: quoteRequestData.owninguser,
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      let errorMessage = 'An unknown error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = `Error: ${error.response?.data?.message || error.message}`;
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setQuoteData(prev => ({ ...prev, error: errorMessage, loading: false }));
    }
  }, [id]);

  const refetchLocations = useCallback(async () => {
    if (!id) return;

    try {
      const locationsResponse = await axios.get(`http://localhost:7071/api/listQuoteLocationRows?id=${id}`);
      const locations = locationsResponse.data.value || [];

      setQuoteData(prev => ({
        ...prev,
        locations,
        error: null,
      }));
    } catch (error) {
      console.error('Error refetching locations:', error);
      let errorMessage = 'An unknown error occurred while refetching locations';
      if (axios.isAxiosError(error)) {
        errorMessage = `Error: ${error.response?.data?.message || error.message}`;
      } else if (error instanceof Error) {
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
