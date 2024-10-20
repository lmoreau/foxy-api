import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { QuoteLocation, QuoteLineItem, QuoteRequest } from '../types';

interface QuoteData {
  accountName: string;
  quoteId: string;
  locations: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  error: string | null;
  loading: boolean;
}

export const useQuoteData = (id: string | undefined) => {
  const [quoteData, setQuoteData] = useState<QuoteData>({
    accountName: '',
    quoteId: '',
    locations: [],
    lineItems: {},
    error: null,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
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

        setQuoteData({
          accountName: quoteRequestData.foxy_Account.name,
          quoteId: quoteRequestData.foxy_quoteid,
          locations,
          lineItems: lineItemsMap,
          error: null,
          loading: false,
        });
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
    };

    setQuoteData(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [id]);

  return quoteData;
};
