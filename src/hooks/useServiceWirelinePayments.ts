import { useState, useEffect } from 'react';
import { listIncomingWirelinePaymentsByWonService } from '../utils/api';
import { IncomingWirelinePayment } from '../types/wirelinePayments';

export const useServiceWirelinePayments = (selectedServiceId: string | null) => {
  const [servicePaymentsData, setServicePaymentsData] = useState<IncomingWirelinePayment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!selectedServiceId) {
      setServicePaymentsData([]);
      return;
    }

    setLoading(true);
    try {
      const response = await listIncomingWirelinePaymentsByWonService(selectedServiceId);
      setServicePaymentsData(response.value || []);
    } catch (error) {
      console.error('Error fetching service payments:', error);
      setServicePaymentsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedServiceId]);

  return {
    servicePaymentsData,
    servicePaymentsLoading: loading,
  };
}; 