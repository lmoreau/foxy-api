import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SortOrder } from 'antd/es/table/interface';
import { OpportunityRecord } from '../types/residualTypes';
import { formatCurrency } from '../utils/formatters';
import { getStatusCodeLabel } from '../utils/statusCodeMapper';
import { getOpportunityTypeInfo } from '../utils/opportunityTypeMapper';
import { getStateCodeLabel } from '../utils/constants/statusColors';

const opportunityColumns: ColumnsType<OpportunityRecord> = [
  { 
    title: 'Name', 
    dataIndex: 'name',
    width: '20%',
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
    title: 'Actual Close Date', 
    dataIndex: 'actualclosedate', 
    width: '15%',
    defaultSortOrder: 'ascend' as SortOrder,
    sorter: (a: OpportunityRecord, b: OpportunityRecord) => {
      const dateA = a.actualclosedate ? new Date(a.actualclosedate).getTime() : 0;
      const dateB = b.actualclosedate ? new Date(b.actualclosedate).getTime() : 0;
      return dateB - dateA;
    },
    render: (text: string) => (
      <Tag color="purple">
        {text ? new Date(text).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'N/A'}
      </Tag>
    )
  },
  { 
    title: 'Actual Value', 
    dataIndex: 'actualvalue', 
    width: '15%', 
    render: (value: number) => {
      const amount = value || 0;
      const color = amount === 0 ? 'red' : 'green';
      return (
        <Tag color={color}>
          {formatCurrency(amount)}
        </Tag>
      );
    }
  },
  { 
    title: 'SFDC Opportunity ID', 
    dataIndex: 'foxy_sfdcoppid', 
    width: '20%',
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
    width: '10%',
    render: (code: number) => getStatusCodeLabel(code) || 'N/A' 
  },
  { 
    title: 'State', 
    dataIndex: 'statecode', 
    width: '10%',
    render: (code: number) => {
      const { label, color } = getStateCodeLabel(code);
      return <Tag color={color}>{label}</Tag>;
    }
  }
];

interface OpportunitiesTableProps {
  opportunities: OpportunityRecord[];
  loading: boolean;
  error: string | null;
}

export const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({
  opportunities,
  loading,
  error
}) => {
  if (loading) return <div>Loading opportunities...</div>;
  if (error) return <div>Error loading opportunities: {error}</div>;

  return (
    <div style={{ marginBottom: '24px' }}>
      <Table
        columns={opportunityColumns}
        dataSource={opportunities}
        rowKey="opportunityid"
        pagination={false}
        size="middle"
        scroll={{ x: 1500 }}
        className="rounded-table"
      />
    </div>
  );
};
