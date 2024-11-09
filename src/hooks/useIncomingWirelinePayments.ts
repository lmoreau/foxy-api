import { useState, useEffect, useCallback } from 'react';
import { useIsAuthenticated } from "@azure/msal-react";
import { listIncomingWirelinePayments } from '../utils/api';
import { IncomingWirelinePayment } from '../types/wirelinePayments';
import dayjs, { Dayjs } from 'dayjs';

export const useIncomingWirelinePayments = () => {
  const [allPaymentsData, setAllPaymentsData] = useState<IncomingWirelinePayment[]>([]);
  const [displayedPaymentsData, setDisplayedPaymentsData] = useState<IncomingWirelinePayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(() => {
    const today = dayjs();
    const sixtyDaysAgo = today.subtract(60, 'day');
    return [sixtyDaysAgo, today];
  });
  
  const isAuthenticated = useIsAuthenticated();

  const fetchPaymentsData = useCallback(async (showAll: boolean) => {
    if (!isAuthenticated) return;
    
    setPaymentsLoading(true);
    try {
      const startDate = dateRange[0].toISOString();
      const endDate = dateRange[1].toISOString();
      
      const response = await listIncomingWirelinePayments(showAll, startDate, endDate);
      setAllPaymentsData(response);
      setDisplayedPaymentsData(response);
    } catch (error) {
      console.error('Error fetching payments data:', error);
    } finally {
      setPaymentsLoading(false);
    }
  }, [isAuthenticated, dateRange]);

  useEffect(() => {
    fetchPaymentsData(showAllRecords);
  }, [fetchPaymentsData, showAllRecords]);

  const handleRowSelection = (selectedRowKeys: React.Key[]) => {
    const selectedId = selectedRowKeys[0] as string;
    setSelectedPaymentId(selectedId);

    if (selectedId) {
      const selectedPayment = allPaymentsData.find(p => p.foxy_incomingpaymentid === selectedId);
      if (selectedPayment?.foxy_opportunitynumber) {
        const filteredPayments = allPaymentsData.filter(
          p => p.foxy_opportunitynumber === selectedPayment.foxy_opportunitynumber
        );
        setDisplayedPaymentsData(filteredPayments);
      }
    } else {
      setDisplayedPaymentsData(allPaymentsData);
    }
  };

  const toggleShowAll = () => {
    setShowAllRecords(!showAllRecords);
    setSelectedPaymentId(null); // Reset selection when toggling
  };

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  return {
    allPaymentsData,
    displayedPaymentsData,
    paymentsLoading,
    selectedPaymentId,
    showAllRecords,
    dateRange,
    handleRowSelection,
    toggleShowAll,
    handleDateRangeChange,
  };
};
