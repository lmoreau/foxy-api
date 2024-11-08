import { useState, useEffect } from 'react';
import { useIsAuthenticated } from "@azure/msal-react";
import { listWonServicesForComp } from '../utils/api';
import { WonService } from '../types/wonServices';
import { IncomingWirelinePayment } from '../types/wirelinePayments';

export const useWonServices = (selectedPaymentId: string | null, allPaymentsData: IncomingWirelinePayment[]) => {
  const [servicesData, setServicesData] = useState<WonService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const fetchServicesData = async () => {
      if (!isAuthenticated || !selectedPaymentId) {
        setServicesData([]);
        return;
      }

      const selectedPayment = allPaymentsData.find(p => p.foxy_incomingpaymentid === selectedPaymentId);
      if (!selectedPayment?.foxy_opportunitynumber) {
        setServicesData([]);
        return;
      }
      
      setServicesLoading(true);
      try {
        const response = await listWonServicesForComp(selectedPayment.foxy_opportunitynumber);
        setServicesData(response.value || []);
      } catch (error) {
        console.error('Error fetching services data:', error);
        setServicesData([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServicesData();
  }, [isAuthenticated, selectedPaymentId, allPaymentsData]);

  const handleServiceSelection = (selectedRowKeys: React.Key[]) => {
    setSelectedServiceId(selectedRowKeys[0] as string);
  };

  return {
    servicesData,
    servicesLoading,
    selectedServiceId,
    handleServiceSelection,
  };
};
