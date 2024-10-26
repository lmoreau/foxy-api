import { useState, useEffect, useMemo } from 'react';
import { 
  getAccountById, 
  listWirelineResidualRows, 
  listRogersWirelineRecords, 
  listOpportunityRows, 
  listResidualAuditByRows 
} from '../utils/api';
import { combineResidualData } from '../utils/residualUtils';
import { 
  AccountData, 
  ResidualRecord, 
  WirelineRecord, 
  OpportunityRecord, 
  AuditRecord,
  TableRecord 
} from '../types/residualTypes';

interface ResidualDetailsState {
  accountData: AccountData | null;
  residualData: ResidualRecord[];
  wirelineData: WirelineRecord[];
  opportunities: OpportunityRecord[];
  auditData: AuditRecord[];
  loading: boolean;
  error: string | null;
  isModalVisible: boolean;
  selectedValue: string;
  updating: boolean;
}

export const useResidualDetailsData = (id: string | undefined) => {
  const [state, setState] = useState<ResidualDetailsState>({
    accountData: null,
    residualData: [],
    wirelineData: [],
    opportunities: [],
    auditData: [],
    loading: true,
    error: null,
    isModalVisible: false,
    selectedValue: '',
    updating: false
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [account, residuals, wireline, oppsResponse, auditResponse] = await Promise.all([
          getAccountById(id),
          listWirelineResidualRows(id),
          listRogersWirelineRecords(id),
          listOpportunityRows(id),
          listResidualAuditByRows(id)
        ]);

        setState(prev => ({
          ...prev,
          accountData: account,
          residualData: residuals,
          wirelineData: wireline,
          opportunities: oppsResponse.value,
          auditData: auditResponse.value,
          loading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'An error occurred',
          loading: false
        }));
      }
    };

    fetchData();
  }, [id]);

  const combinedData = useMemo<TableRecord[]>(() => 
    combineResidualData(state.residualData, state.wirelineData),
    [state.residualData, state.wirelineData]
  );

  const setModalVisible = (visible: boolean) => {
    setState(prev => ({ ...prev, isModalVisible: visible }));
  };

  const setSelectedValue = (value: string) => {
    setState(prev => ({ ...prev, selectedValue: value }));
  };

  return {
    ...state,
    combinedData,
    setModalVisible,
    setSelectedValue
  };
};
