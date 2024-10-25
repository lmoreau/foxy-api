import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
import { getAccountById, listWirelineResidualRows, listRogersWirelineRecords, listOpportunityRows as fetchOpportunities, listResidualAuditByRows } from '../utils/api';
import { AccountData, ResidualRecord, WirelineRecord, OpportunityRecord } from '../types/residualTypes';
import { combineResidualData } from '../utils/residualUtils';
import { ResidualTable } from './ResidualTable';
import { ResidualStatusModal } from './ResidualStatusModal';
import { formatCurrency } from '../utils/formatters';
import { getStatusCodeLabel } from '../utils/statusCodeMapper';
import { getOpportunityTypeInfo } from '../utils/opportunityTypeMapper';

interface AuditRecord {
  crc9f_residualscrubauditid: string;
  crc9f_newstatus: number;
  crc9f_updatedon: string;
  crc9f_note?: string;
  owninguser: {
    fullname: string;
  };
}

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

// Status color mapping
const getStatusColor = (status: number): string => {
  const colorMap: { [key: number]: string } = {
    755280000: 'default',    // Status Unknown
    755280001: 'red',        // Not Eligible
    755280002: 'orange',     // Pending Start
    755280003: 'green',      // Active
    755280004: 'red',        // Issue - None Paying
    755280005: 'orange',     // Issue - Some Paying
    755280006: 'cyan',       // Issue - Ready to Submit
    755280007: 'purple',     // Issue - Clarification Needed
    755280008: 'magenta',    // Issue - Disputed to Comp
    947760001: 'gold',       // Legacy Issue
  };
  return colorMap[status] || 'default';
};

export const ResidualDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState({
    accountData: null as AccountData | null,
    residualData: [] as ResidualRecord[],
    wirelineData: [] as WirelineRecord[],
    opportunities: [] as OpportunityRecord[],
    auditData: [] as AuditRecord[],
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
      width: '15%',
      ellipsis: {
        showTitle: false
      },
      render: (text: string, record: OpportunityRecord) => (
        <Tooltip placement="topLeft" title={text || 'N/A'}>
          <a 
            href={`https://foxy.crm3.dynamics.com/main.aspx?appid=a5e9eec5-dda4-eb11-9441-000d3a848fc5&pagetype=entityrecord&etn=opportunity&id=${record.opportunityid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text || 'N/A'}
          </a>
        </Tooltip>
      )
    },
    { 
      title: 'Actual Value', 
      dataIndex: 'actualvalue', 
      width: '15%', 
      render: (value: number) => formatCurrency(value) || 'N/A' 
    },
    { 
      title: 'SFDC Opportunity ID', 
      dataIndex: 'foxy_sfdcoppid', 
      width: '15%',
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text || 'N/A'}>
          {text || 'N/A'}
        </Tooltip>
      )
    },
    { 
      title: 'Opportunity Type',
      dataIndex: 'foxy_opportunitytype',
      width: '15%',
      render: (code: number) => {
        const { label, color } = getOpportunityTypeInfo(code);
        return <Tag color={color}>{label}</Tag>;
      }
    },
    { 
      title: 'Status', 
      dataIndex: 'statuscode', 
      width: '15%',
      render: (code: number) => getStatusCodeLabel(code) || 'N/A' 
    },
    { 
      title: 'Actual Close Date', 
      dataIndex: 'actualclosedate', 
      width: '10%',
      render: (text: string) => text || 'N/A' 
    },
    { 
      title: 'Foxy Stage', 
      dataIndex: 'foxy_foxystage', 
      width: '8%',
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text || 'N/A'}>
          {text || 'N/A'}
        </Tooltip>
      )
    },
    { 
      title: 'Step Name', 
      dataIndex: 'stepname', 
      width: '7%',
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text || 'N/A'}>
          {text || 'N/A'}
        </Tooltip>
      )
    }
  ];

  const auditColumns: ColumnsType<AuditRecord> = [
    {
      title: 'Status',
      dataIndex: 'crc9f_newstatus',
      width: '15%',
      minWidth: 150,
      render: (status: number | null) => {
        if (status === null || status === undefined) {
          return <Tag color="default">Unknown</Tag>;
        }
        const label = getWirelineResidualsLabel(status);
        const color = getStatusColor(status);
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Created On',
      dataIndex: 'crc9f_updatedon',
      width: '15%',
      minWidth: 150,
      defaultSortOrder: 'descend',
      sorter: (a: AuditRecord, b: AuditRecord) => {
        const dateA = new Date(a.crc9f_updatedon).getTime();
        const dateB = new Date(b.crc9f_updatedon).getTime();
        return dateA - dateB;
      },
      render: (date: string) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    },
    { 
      title: 'Created By', 
      dataIndex: ['owninguser', 'fullname'], 
      width: '20%',
      minWidth: 150,
      render: (text: string) => <Tag color="blue">{text || 'N/A'}</Tag>
    },
    { 
      title: 'Note', 
      dataIndex: 'crc9f_note', 
      width: '50%',
      render: (text: string | undefined) => (
        <div style={{ 
          whiteSpace: 'pre-wrap', 
          wordWrap: 'break-word',
          maxWidth: '100%'
        }}>
          {text || ''}
        </div>
      )
    }
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Wireline Residuals:</span>
          <Tag color="blue">{getWirelineResidualsLabel(state.accountData.foxyflow_wirelineresiduals)}</Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Services:</span>
          {state.accountData.foxy_cable && <Tag color={serviceColors.Cable}>Cable</Tag>}
          {state.accountData.foxy_datacentre && <Tag color={serviceColors['Data Centre']}>Data Centre</Tag>}
          {state.accountData.foxy_fibreinternet && <Tag color={serviceColors['Fibre Internet']}>Fibre Internet</Tag>}
          {state.accountData.foxy_gpon && <Tag color={serviceColors.GPON}>GPON</Tag>}
          {state.accountData.foxy_microsoft365 && <Tag color={serviceColors['Microsoft 365']}>Microsoft 365</Tag>}
          {state.accountData.foxy_res && <Tag color={serviceColors.RES}>RES</Tag>}
          {state.accountData.foxy_sip && <Tag color={serviceColors.SIP}>SIP</Tag>}
          {state.accountData.foxy_unison && <Tag color={serviceColors.Unison}>Unison</Tag>}
        </div>
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
          scroll={{ x: 1500 }}
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
          scroll={{ x: 1200 }}
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
