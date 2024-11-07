import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, Card, Space, Typography, Collapse, Breadcrumb, Spin, Alert } from 'antd';
import type { CollapseProps } from 'antd';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { 
  getAccountById, 
  listWirelineResidualRows, 
  listRogersWirelineRecords, 
  listOpportunityRows as fetchOpportunities, 
  listResidualAuditByRows, 
  updateAccountWirelineResiduals, 
  createResidualScrubAudit 
} from '../utils/api';
import { 
  AccountData, 
  ResidualRecord, 
  WirelineRecord, 
  OpportunityRecord,
  AuditRecord,
  TableRecord
} from '../types/residualTypes';
import { combineResidualData } from '../utils/residualUtils';
import { ResidualTable } from './ResidualTable';
import { ResidualStatusModal } from './ResidualStatusModal';
import { AccountHeader } from './AccountHeader';
import { OpportunitiesTable } from './OpportunitiesTable';
import { AuditTable } from './AuditTable';
import { formatCurrency } from '../utils/formatters';

const { Text, Title } = Typography;

// Custom panel header component to maintain heading styling
const PanelHeader: React.FC<{ title: string }> = ({ title }) => (
  <Title level={4} style={{ margin: 0, fontWeight: 600 }}>{title}</Title>
);

interface State {
  accountData: AccountData | null;
  residualData: ResidualRecord[];
  wirelineData: WirelineRecord[];
  opportunities: OpportunityRecord[];
  auditData: AuditRecord[]; // Updated to use proper type
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
  showUnmerged: boolean;
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
  updating: false,
  showUnmerged: false
};

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setState(prev => ({ ...prev, error: 'No ID provided', loading: false }));
        return;
      }

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
          opportunities: oppsResponse.value || [],
          auditData: auditResponse.value || [],
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
      await createResidualScrubAudit(id, state.selectedValue, state.notes);
      await updateAccountWirelineResiduals(id, state.selectedValue);
      const auditResponse = await listResidualAuditByRows(id);
      
      setState(prev => ({
        ...prev,
        isModalVisible: false,
        updating: false,
        selectedValue: '',
        notes: '',
        auditData: auditResponse.value || [],
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

  const handleToggleUnmerged = (checked: boolean) => {
    setState(prev => ({ ...prev, showUnmerged: checked }));
  };

  const combinedData = React.useMemo<TableRecord[]>(() => 
    combineResidualData(state.residualData, state.wirelineData, state.showUnmerged),
    [state.residualData, state.wirelineData, state.showUnmerged]
  );

  const opportunityStats = React.useMemo(() => {
    const wonOpps = state.opportunities.filter(opp => opp.statecode === 1);
    const lostOpps = state.opportunities.filter(opp => opp.statecode === 2);

    // Safely handle optional number fields
    const wonTotal = wonOpps.reduce((sum, opp) => sum + (opp.actualvalue ?? 0), 0);
    const lostTotal = lostOpps.reduce((sum, opp) => sum + (opp.estimatedvalue ?? 0), 0);

    return {
      wonCount: wonOpps.length,
      lostCount: lostOpps.length,
      wonTotal,
      lostTotal
    };
  }, [state.opportunities]);

  const collapseItems: CollapseProps['items'] = [
    {
      key: '1',
      label: <PanelHeader title="Billing Services" />,
      children: (
        <div style={{ marginBottom: '24px' }}>
          <ResidualTable 
            data={combinedData} 
            showUnmerged={state.showUnmerged}
            onToggleUnmerged={handleToggleUnmerged}
          />
        </div>
      )
    },
    {
      key: '2',
      label: <PanelHeader title="Opportunities" />,
      children: (
        <OpportunitiesTable
          opportunities={state.opportunities}
          loading={state.opportunitiesLoading}
          error={state.opportunitiesError}
        />
      )
    },
    {
      key: '3',
      label: <PanelHeader title="Residual Audit History" />,
      children: (
        <AuditTable
          auditData={state.auditData}
          loading={state.auditLoading}
          error={state.auditError}
        />
      )
    }
  ];

  if (state.error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert type="error" message={state.error} />
      </div>
    );
  }

  if (state.loading || !state.accountData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: '16px' }} items={[
        { title: <Link to="/residual-check">Residual Account List</Link> },
        { title: 'Account Details' }
      ]} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: '1' }}>
          <AccountHeader
            accountData={state.accountData}
            onEditStatus={handleOpenModal}
            accountId={id || ''}
          />
        </div>
        <Space size="small" style={{ marginLeft: 16 }}>
          <Card size="small" style={{ width: 180 }}>
            <div>
              <Text>{opportunityStats.wonCount} Won Opps.</Text>
              <br />
              <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: 'bold' }}>
                {formatCurrency(opportunityStats.wonTotal)}
              </Text>
            </div>
          </Card>
          <Card size="small" style={{ width: 180 }}>
            <div>
              <Text>{opportunityStats.lostCount} Lost Opps.</Text>
              <br />
              <Text style={{ color: '#f5222d', fontSize: '14px', fontWeight: 'bold' }}>
                {formatCurrency(opportunityStats.lostTotal)}
              </Text>
            </div>
          </Card>
        </Space>
      </div>

      <Tabs
        items={[
          {
            key: '1',
            label: 'Billing Profile',
            children: (
              <div className="custom-collapse">
                <style>
                  {`
                    .custom-collapse .ant-collapse-content-box {
                      padding-left: 0 !important;
                      padding-right: 0 !important;
                    }
                    .custom-collapse .ant-collapse-header {
                      padding-left: 0 !important;
                    }
                    .custom-collapse .ant-collapse-expand-icon {
                      padding-right: 8px !important;
                    }
                  `}
                </style>
                <Collapse 
                  defaultActiveKey={['1', '2', '3']} 
                  ghost
                  expandIcon={({ isActive }) => 
                    isActive ? 
                      <MinusSquareOutlined style={{ fontSize: '16px' }} /> : 
                      <PlusSquareOutlined style={{ fontSize: '16px' }} />
                  }
                  items={collapseItems}
                />
              </div>
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

export default ResidualDetails;
