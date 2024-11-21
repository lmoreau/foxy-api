import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { QuoteLocation, QuoteLineItem } from '../types';
import { getQuoteRequestById, listQuoteLocationRows, listQuoteLineItemByRow } from '../utils/api';

// Add performance measurement utilities
const _now = () => performance.now();
const _formatDuration = (start: number, end: number) => `${(end - start).toFixed(2)}ms`;

// Add cache utilities
const CACHE_PREFIX = 'foxy_quote_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const getFromCache = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    return null;
  }
};

const setToCache = <T>(key: string, data: T): void => {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (error) {
    console.error('[Cache] Error writing to cache:', error);
  }
};

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
    const startTime = _now();
    console.log(`[QuoteData] Starting data fetch for quote ID: ${id}`);

    if (!id || !/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(id)) {
      console.error(`[QuoteData] Invalid quote ID provided: ${id}`);
      setState(prev => ({ ...prev, error: 'Invalid quote ID. Please provide a valid GUID.', loading: false }));
      return;
    }

    try {
      // Check cache first
      const cachedData = getFromCache<QuoteDataState>(id);
      if (cachedData) {
        console.log('[QuoteData] Using cached data');
        setState(cachedData);
        setLineItems(cachedData.lineItems);
        return;
      }

      // Fetch quote request data
      console.log(`[QuoteData] Fetching quote request data for ID: ${id}`);
      const quoteRequestStartTime = _now();
      
      // Fetch quote request and locations in parallel
      const [quoteRequestData, locationsResponse] = await Promise.all([
        getQuoteRequestById(id),
        listQuoteLocationRows(id)
      ]);
      
      console.log(`[QuoteData] Quote request data fetch completed in ${_formatDuration(quoteRequestStartTime, _now())}`);
      console.log(`[QuoteData] Quote request data:`, quoteRequestData);

      if (!quoteRequestData?.foxy_Account) {
        console.error('[QuoteData] Quote data is incomplete - missing Account information');
        setState(prev => ({
          ...prev,
          error: 'Quote data is incomplete or malformed',
          loading: false
        }));
        return;
      }

      // Process locations
      const locations = locationsResponse.value || [];
      console.log(`[QuoteData] Found ${locations.length} locations`);

      // Fetch line items for all locations in parallel
      console.log(`[QuoteData] Starting parallel line items fetch for ${locations.length} locations`);
      const lineItemsStartTime = _now();
      
      const lineItemsPromises = locations.map((location: QuoteLocation) => 
        listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid)
          .then(response => ({
            locationId: location.foxy_foxyquoterequestlocationid,
            items: response.value || []
          }))
          .catch(error => {
            console.error(`[QuoteData] Failed to load line items for location ${location.foxy_locationid}:`, error);
            message.error(`Failed to load line items for location ${location.foxy_locationid}`);
            return {
              locationId: location.foxy_foxyquoterequestlocationid,
              items: []
            };
          })
      );

      const lineItemsResults = await Promise.all(lineItemsPromises);
      const lineItemsMap = lineItemsResults.reduce((acc, { locationId, items }) => {
        acc[locationId] = items;
        return acc;
      }, {} as { [key: string]: QuoteLineItem[] });

      console.log(`[QuoteData] All line items fetched in parallel in ${_formatDuration(lineItemsStartTime, _now())}`);
      console.log(`[QuoteData] Total line items:`, Object.values(lineItemsMap).flat().length);

      // Update state
      const updateStartTime = _now();
      const newState = {
        accountName: quoteRequestData.foxy_Account?.name || 'Unknown Account',
        accountId: quoteRequestData.foxy_Account?.accountid || '',
        quoteId: quoteRequestData.foxy_quoteid || '',
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
      };

      setToCache(id, newState);
      setLineItems(lineItemsMap);
      setState(newState);
      console.log(`[QuoteData] State update completed in ${_formatDuration(updateStartTime, _now())}`);

      const totalTime = _formatDuration(startTime, _now());
      console.log(`[QuoteData] Total fetch operation completed in ${totalTime}`);
      console.log(`[QuoteData] Performance breakdown:
        - Quote Request and Locations: ${_formatDuration(quoteRequestStartTime, lineItemsStartTime)}
        - Line Items: ${_formatDuration(lineItemsStartTime, updateStartTime)}
        - State Update: ${_formatDuration(updateStartTime, _now())}
        - Total: ${totalTime}
      `);

    } catch (error) {
      console.error('[QuoteData] Error in fetchData:', error);
      console.error('[QuoteData] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      setState(prev => ({
        ...prev,
        error: 'Failed to load quote data',
        loading: false
      }));
    }
  }, [id]);

  const refetchLocations = useCallback(async () => {
    if (!id) return;

    const startTime = _now();
    console.log(`[QuoteData] Starting location refetch for quote ID: ${id}`);

    try {
      const locationsStartTime = _now();
      const locationsResponse = await listQuoteLocationRows(id);
      const locations = locationsResponse.value || [];
      console.log(`[QuoteData] Locations refetch completed in ${_formatDuration(locationsStartTime, _now())}`);
      console.log(`[QuoteData] Found ${locations.length} locations during refetch`);

      const lineItemsStartTime = _now();
      const lineItemsMap: { [key: string]: QuoteLineItem[] } = {};
      for (const location of locations) {
        const locationStartTime = _now();
        try {
          console.log(`[QuoteData] Refetching line items for location: ${location.foxy_foxyquoterequestlocationid}`);
          const lineItemsResponse = await listQuoteLineItemByRow(location.foxy_foxyquoterequestlocationid);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = lineItemsResponse.value || [];
          console.log(`[QuoteData] Refetched ${lineItemsMap[location.foxy_foxyquoterequestlocationid].length} line items for location ${location.foxy_locationid} in ${_formatDuration(locationStartTime, _now())}`);
        } catch (error) {
          console.error(`[QuoteData] Failed to refetch line items for location ${location.foxy_locationid}:`, error);
          message.error(`Failed to load line items for location ${location.foxy_locationid}`);
          lineItemsMap[location.foxy_foxyquoterequestlocationid] = [];
        }
      }
      console.log(`[QuoteData] All line items refetched in ${_formatDuration(lineItemsStartTime, _now())}`);

      const updateStartTime = _now();
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
      console.log(`[QuoteData] Refetch state update completed in ${_formatDuration(updateStartTime, _now())}`);
      console.log(`[QuoteData] Total refetch operation completed in ${_formatDuration(startTime, _now())}`);

    } catch (error) {
      console.error('[QuoteData] Error in refetchLocations:', error);
      console.error('[QuoteData] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      message.error('Failed to refresh locations');
    }
  }, [id]);

  const refetch = useCallback(async () => {
    if (!id) return;
    
    const startTime = _now();
    console.log(`[QuoteData] Starting quote data refetch for ID: ${id}`);
    
    setState(prev => ({ ...prev, loading: true }));
    try {
      const quoteStartTime = _now();
      const quoteData = await getQuoteRequestById(id);
      console.log(`[QuoteData] Quote data refetch completed in ${_formatDuration(quoteStartTime, _now())}`);

      const updateStartTime = _now();
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
      console.log(`[QuoteData] Refetch state update completed in ${_formatDuration(updateStartTime, _now())}`);
      console.log(`[QuoteData] Total refetch operation completed in ${_formatDuration(startTime, _now())}`);

    } catch (error) {
      console.error('[QuoteData] Error in refetch:', error);
      console.error('[QuoteData] Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
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
    console.log('[QuoteData] No ID provided, returning empty state');
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
