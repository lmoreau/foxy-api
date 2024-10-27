import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { getAccountById, listWirelineResidualRows, listRogersWirelineRecords, listOpportunityRows as fetchOpportunities, listResidualAuditByRows, updateAccountWirelineResiduals, createResidualScrubAudit } from '../utils/api';
import { AccountData, ResidualRecord, WirelineRecord, OpportunityRecord } from '../types/residualTypes';
import { combineResidualData } from '../utils/residualUtils';
import { ResidualTable } from './ResidualTable';
import { ResidualStatusModal } from './ResidualStatusModal';
import { AccountHeader } from './AccountHeader';
import { OpportunitiesTable } from './OpportunitiesTable';
import { AuditTable } from './AuditTable';

interface State {
  accountData: AccountData | null;
  residualData: ResidualRecord[];
  wirelineData: WirelineRecord[];
  opportunities: OpportunityRecord[];
  auditData: any[];
  loading: boolean;
  opportunitiesLoading: boolean;
  auditLoading: boolean;
  error: string | null;
  opportunitiesError: string | null;
  auditError: string | null;
  isModalVisible: boolean;
  selectedValue: string;
  notes: string;
  updating: boolean;
}

const initialState: State = {
  accountData: null,
  residualData: [],
  wirelineData: [],
  opportunities: [],
  auditData: [],
  loading: true,
  opportunitiesLoading: true,
  auditLoading: true,
  error: null,
  opportunitiesError: null,
  auditError: null,
  isModalVisible: false,
  selectedValue: '',
  notes: '',
  updating: false
};

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [account, residuals, wireline, oppsResponse, auditResponse] = await Promise.all([
          getAccountById(id),
          listWirelineResidualRows(id),
          listRogersWirelineRecords(id),
          fetchOpportunities(id),
          listResidualAuditByRows(id)
        ]);

        setState(prev => ({
          ...prev,
          accountData: account,
          residualData: residuals,
          wirelineData: wireline,
          opportunities: oppsResponse.value,
          auditData: auditResponse.value,
          loading: false,
          opportunitiesLoading: false,
          auditLoading: false
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'An error occurred',
          loading: false,
          opportunitiesLoading: false,
          auditLoading: false
        }));
      }
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!id || !state.selectedValue) return;

    setState(prev => ({ ...prev, updating: true }));
    try {
      // Create audit record first
      await createResidualScrubAudit(id, state.selectedValue, state.notes);
      
      // Then update the account status
      await updateAccountWirelineResiduals(id, state.selectedValue);

      // Refresh the audit data
      const auditResponse = await listResidualAuditByRows(id);
      
      // Update local state
      setState(prev => ({
        ...prev,
        isModalVisible: false,
        updating: false,
        selectedValue: '',
        notes: '',
        auditData: auditResponse.value,
        accountData: prev.accountData ? {
          ...prev.accountData,
          foxyflow_wirelineresiduals: parseInt(state.selectedValue)
        } : null
      }));
    } catch (error) {
      console.error('Error updating status:', error);
      setState(prev => ({ ...prev, updating: false }));
    }
  };

  const handleOpenModal = () => {
    setState(prev => ({ 
      ...prev, 
      isModalVisible: true,
      selectedValue: prev.accountData ? prev.accountData.foxyflow_wirelineresiduals.toString() : ''
    }));
  };

  const combinedData = React.useMemo(() => 
    combineResidualData(state.residualData, state.wirelineData),
    [state.residualData, state.wirelineData]
  );

  if (state.error) return <div>Error: {state.error}</div>;
  if (state.loading || !state.accountData) return <div>Loading...</div>;

  return (
    <div>
      <AccountHeader
        accountData={state.accountData}
        onEditStatus={handleOpenModal}
        accountId={id || ''}
      />

      <Tabs
        items={[
          {
            key: '1',
            label: 'Billing Profile',
            children: (
              <>
                <h2>Billing Services</h2>
                <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                  <ResidualTable data={combinedData} />
                </div>

                <h2>Opportunities</h2>
                <OpportunitiesTable
                  opportunities={state.opportunities}
                  loading={state.opportunitiesLoading}
                  error={state.opportunitiesError}
                />

                <h2>Residual Audit History</h2>
                <AuditTable
                  auditData={state.auditData}
                  loading={state.auditLoading}
                  error={state.auditError}
                />
              </>
            ),
          },
          {
            key: '2',
            label: 'Callidus Payments',
            children: <div></div>,
          }
        ]}
      />

      <ResidualStatusModal
        isVisible={state.isModalVisible}
        selectedValue={state.selectedValue}
        notes={state.notes}
        onValueChange={(value) => setState(prev => ({ ...prev, selectedValue: value }))}
        onNotesChange={(value) => setState(prev => ({ ...prev, notes: value }))}
        onOk={handleStatusUpdate}
        onCancel={() => setState(prev => ({ 
          ...prev, 
          isModalVisible: false,
          selectedValue: '',
          notes: ''
        }))}
        updating={state.updating}
      />
    </div>
  );
};
