import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Table, Tag } from 'antd';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
import { getAccountById, listWirelineResidualRows, listRogersWirelineRecords, listOpportunityRows as fetchOpportunities, listResidualAuditByRows } from '../utils/api';
import { AccountData, ResidualRecord, WirelineRecord, OpportunityRecord } from '../types/residualTypes';
import { combineResidualData } from '../utils/residualUtils';
import { ResidualTable } from './ResidualTable';
import { ResidualStatusModal } from './ResidualStatusModal';
import { formatCurrency } from '../utils/formatters';
import { getStatusCodeLabel } from '../utils/statusCodeMapper';
import { getOpportunityTypeInfo } from '../utils/opportunityTypeMapper';

const serviceColors = {
  Cable: 'blue',
  'Fibre Internet': 'green',
  GPON: 'cyan',
  'Microsoft 365': 'purple',
  RES: 'magenta',
  SIP: 'orange',
  Unison: 'geekblue',
  'Data Centre': 'volcano',
};

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState({
    accountData: null as AccountData | null,
    residualData: [] as ResidualRecord[],
    wirelineData: [] as WirelineRecord[],
    opportunities: [] as OpportunityRecord[],
    auditData: [] as any[],
    loading: true,
    opportunitiesLoading: true,
    auditLoading: true,
    error: null as string | null,
    opportunitiesError: null as string | null,
    auditError: null as string | null,
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

  const combinedData = React.useMemo(() => 
    combineResidualData(state.residualData, state.wirelineData),
    [state.residualData, state.wirelineData]
  );

  const opportunityColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      render: (text: string, record: OpportunityRecord) => (
        <a 
          href={`https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&pagetype=entityrecord&etn=opportunity&id=${record.opportunityid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text || 'N/A'}
        </a>
      )
    },
    { title: 'Actual Value', dataIndex: 'actualvalue', render: (value: number) => formatCurrency(value) || 'N/A' },
    { title: 'SFDC Opportunity ID', dataIndex: 'foxy_sfdcoppid', render: (text: string) => text || 'N/A' },
    { 
      title: 'Opportunity Type',
      dataIndex: 'foxy_opportunitytype',
      render: (code: number) => {
        const { label, color } = getOpportunityTypeInfo(code);
        return <Tag color={color}>{label}</Tag>;
      }
    },
    { title: 'Status', dataIndex: 'statuscode', render: (code: number) => getStatusCodeLabel(code) || 'N/A' },
    { title: 'Actual Close Date', dataIndex: 'actualclosedate', render: (text: string) => text || 'N/A' },
    { title: 'Foxy Stage', dataIndex: 'foxy_foxystage', render: (text: string) => text || 'N/A' },
    { title: 'Step Name', dataIndex: 'stepname', render: (text: string) => text || 'N/A' }
  ];

  const auditColumns = [
    {
      title: 'Status',
      dataIndex: 'crc9f_newstatus',
      render: (status: number) => {
        const statusConfig = {
          755280001: { label: 'Status 1', color: 'blue' },
          755280003: { label: 'Status 3', color: 'green' }
        }[status] || { label: 'Unknown', color: 'default' };
        return <Tag color={statusConfig.color}>{statusConfig.label}</Tag>;
      }
    },
    {
      title: 'Created On',
      dataIndex: 'createdon',
      render: (date: string) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    },
    { title: 'Modified By', dataIndex: ['owninguser', 'fullname'], render: (text: string) => text || 'N/A' }
  ];

  if (state.error) return <div>Error: {state.error}</div>;
  if (state.loading || !state.accountData) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <h1 style={{ margin: 0 }}>{state.accountData.name}</h1>
        <Button type="primary" onClick={() => setState(prev => ({ ...prev, isModalVisible: true }))}>
          Edit Status
        </Button>
        <Button onClick={() => window.open(`https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&forceUCI=1&pagetype=entityrecord&etn=account&id=${id}`, '_blank')}>
          View in Foxy
        </Button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <p style={{ marginBottom: '8px' }}>Wireline Residuals: <Tag color="blue">{getWirelineResidualsLabel(state.accountData.foxyflow_wirelineresiduals)}</Tag></p>
        
        <p style={{ marginBottom: '8px' }}>Services: {' '}
          {state.accountData.foxy_cable && <Tag color={serviceColors.Cable}>Cable</Tag>}
          {state.accountData.foxy_datacentre && <Tag color={serviceColors['Data Centre']}>Data Centre</Tag>}
          {state.accountData.foxy_fibreinternet && <Tag color={serviceColors['Fibre Internet']}>Fibre Internet</Tag>}
          {state.accountData.foxy_gpon && <Tag color={serviceColors.GPON}>GPON</Tag>}
          {state.accountData.foxy_microsoft365 && <Tag color={serviceColors['Microsoft 365']}>Microsoft 365</Tag>}
          {state.accountData.foxy_res && <Tag color={serviceColors.RES}>RES</Tag>}
          {state.accountData.foxy_sip && <Tag color={serviceColors.SIP}>SIP</Tag>}
          {state.accountData.foxy_unison && <Tag color={serviceColors.Unison}>Unison</Tag>}
        </p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <ResidualTable data={combinedData} />
      </div>

      <h2>Opportunities</h2>
      {state.opportunitiesLoading ? (
        <div>Loading opportunities...</div>
      ) : state.opportunitiesError ? (
        <div>Error loading opportunities: {state.opportunitiesError}</div>
      ) : (
        <Table
          columns={opportunityColumns}
          dataSource={state.opportunities}
          rowKey="opportunityid"
          pagination={false}
          size="middle"
        />
      )}

      <h2>Residual Audit History</h2>
      {state.auditLoading ? (
        <div>Loading audit history...</div>
      ) : state.auditError ? (
        <div>Error loading audit history: {state.auditError}</div>
      ) : (
        <Table
          columns={auditColumns}
          dataSource={state.auditData}
          rowKey="crc9f_residualscrubauditid"
          pagination={false}
          size="middle"
        />
      )}

      <ResidualStatusModal
        isVisible={state.isModalVisible}
        selectedValue={state.selectedValue}
        onValueChange={(value) => setState(prev => ({ ...prev, selectedValue: value }))}
        onOk={() => setState(prev => ({ ...prev, isModalVisible: false }))}
        onCancel={() => setState(prev => ({ ...prev, isModalVisible: false }))}
        updating={state.updating}
      />
    </div>
  );
}
