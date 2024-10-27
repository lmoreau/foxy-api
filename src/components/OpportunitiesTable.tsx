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
    width: '30%',
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
    render: (text: string) => 
      text ? new Date(text).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A'
  },
  { 
    title: 'Amount', 
    dataIndex: 'actualvalue', 
    width: '12%', 
    render: (_: number, record: OpportunityRecord) => {
      // Show actualvalue for WON opportunities, estimatedvalue for OPEN/LOST
      const amount = record.statecode === 1 ? record.actualvalue : record.estimatedvalue;
      const value = amount || 0;
      
      // Color based on state: red for LOST, green for WON, blue for OPEN
      let color;
      if (record.statecode === 2) color = 'red';      // LOST
      else if (record.statecode === 1) color = 'green'; // WON
      else color = 'blue';                             // OPEN

      return (
        <Tag color={color}>
          {formatCurrency(value)}
        </Tag>
      );
    }
  },
  { 
    title: 'Estimated Value', 
    dataIndex: 'estimatedvalue', 
    width: '12%', 
    render: (value: number) => {
      const amount = value || 0;
      const color = amount === 0 ? 'red' : 'blue';
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
    title: 'State', 
    dataIndex: 'statecode', 
    width: '15%',
    render: (code: number, record: OpportunityRecord) => {
      const { label, color } = getStateCodeLabel(code);
      const status = getStatusCodeLabel(record.statuscode);
      return (
        <Tooltip title={`Status: ${status || 'N/A'}`}>
          <Tag color={color}>{label}</Tag>
        </Tooltip>
      );
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
