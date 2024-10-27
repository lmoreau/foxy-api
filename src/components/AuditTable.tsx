import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getWirelineResidualsLabel } from '../utils/wirelineResidualsMapper';
import { getStatusColor } from '../utils/constants/statusColors';

interface AuditRecord {
  crc9f_residualscrubauditid: string;
  crc9f_newstatus: number;
  crc9f_updatedon: string;
  crc9f_note?: string;
  owninguser: {
    fullname: string;
  };
}

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
    title: 'Updated On',
    dataIndex: 'crc9f_updatedon',
    width: '15%',
    minWidth: 150,
    defaultSortOrder: 'descend',
    sorter: (a: AuditRecord, b: AuditRecord) => {
      const dateA = new Date(a.crc9f_updatedon).getTime();
      const dateB = new Date(b.crc9f_updatedon).getTime();
      return dateA - dateB;
    },
    render: (date: string) => new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  },
  { 
    title: 'Updated By', 
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

interface AuditTableProps {
  auditData: AuditRecord[];
  loading: boolean;
  error: string | null;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  auditData,
  loading,
  error
}) => {
  if (loading) return <div>Loading audit history...</div>;
  if (error) return <div>Error loading audit history: {error}</div>;

  return (
    <div style={{ marginBottom: '24px' }}>
      <Table
        columns={auditColumns}
        dataSource={auditData}
        rowKey="crc9f_residualscrubauditid"
        pagination={false}
        size="middle"
        scroll={{ x: 1200 }}
        className="rounded-table"
      />
    </div>
  );
};
