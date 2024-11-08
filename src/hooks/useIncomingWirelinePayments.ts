import { useState, useEffect } from 'react';
import { useIsAuthenticated } from "@azure/msal-react";
import { listIncomingWirelinePayments } from '../utils/api';
import { IncomingWirelinePayment } from '../types/wirelinePayments';

export const useIncomingWirelinePayments = () => {
  const [allPaymentsData, setAllPaymentsData] = useState<IncomingWirelinePayment[]>([]);
  const [displayedPaymentsData, setDisplayedPaymentsData] = useState<IncomingWirelinePayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const fetchPaymentsData = async () => {
      if (!isAuthenticated) return;
      
      setPaymentsLoading(true);
      try {
        const response = await listIncomingWirelinePayments();
        setAllPaymentsData(response);
        setDisplayedPaymentsData(response);
      } catch (error) {
        console.error('Error fetching payments data:', error);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPaymentsData();
  }, [isAuthenticated]);

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

  return {
    allPaymentsData,
    displayedPaymentsData,
    paymentsLoading,
    selectedPaymentId,
    handleRowSelection,
  };
};
