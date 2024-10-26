import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRecord, WirelineRecord, ResidualRecord, MergedRecord } from '../types/residualTypes';
import { formatDescription } from '../utils/residualUtils';

interface ResidualTableProps {
  data: TableRecord[];
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

const DateRange: React.FC<{ startDate: string; endDate: string }> = ({ startDate, endDate }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Tag color="purple">{formatDate(startDate)}</Tag>
      <span style={{ 
        color: '#666', 
        margin: '0 4px',
        display: 'flex',
        alignItems: 'center'
      }}>
        ⟶
      </span>
      <Tag color="red">{formatDate(endDate)}</Tag>
    </div>
  );
};

const columns: ColumnsType<TableRecord> = [
  {
    title: 'Description/Product',
    key: 'description',
    width: '35%',
    render: (_, record) => {
      if ('children' in record) {
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              <span style={{ color: '#1890ff' }}>{record.accountId}</span>
              {' - '}
              <span>{record.companyName}</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">Residual Total: {record.totalResidualAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Tag>
              <Tag color="green">Wireline Total: {record.totalWirelineCharges.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Tag>
            </div>
          </div>
        );
      }

      const isMerged = record.type === 'merged';
      const isWireline = record.type === 'wireline';
      const mergedRecord = record as MergedRecord;
      const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
      const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

      if (isMerged || isWireline) {
        const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
        return (
          <>
            <Tag color={isMerged ? 'purple' : 'green'}>
              {isMerged ? 'Merged' : 'Wireline'}
            </Tag>
            <span>&nbsp;</span>
            {r.foxy_description || 'No Description'}
            {r.foxy_serviceid && (
              <>
                {' '}
                <Tag color="blue">({r.foxy_serviceid})</Tag>
              </>
            )}
            {r.foxy_quantity > 1 && ` x ${r.foxy_quantity}`}
            {r.foxy_contractterm && ` - ${r.foxy_contractterm} months`}
          </>
        );
      }

      return (
        <>
          <Tag color="blue">Residual</Tag>
          <span>&nbsp;</span>
          {residualRecord?.foxyflow_product}
        </>
      );
    },
  },
  {
    title: 'Service Details',
    key: 'serviceDetails',
    width: '15%',
    render: (_, record) => {
      if ('children' in record) return null;

      const isMerged = record.type === 'merged';
      const isWireline = record.type === 'wireline';
      const mergedRecord = record as MergedRecord;
      const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
      const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

      if (isMerged || isWireline) {
        const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
        return (
          r.foxy_addressline1 && (
            <Tooltip title={`${r.foxy_city}, ${r.foxy_province} ${r.foxy_postalcode}`}>
              {r.foxy_addressline1}
            </Tooltip>
          )
        );
      }

      return residualRecord ? (
        <>
          Billing Number: {residualRecord.foxyflow_billingnumber}<br />
          Code: {residualRecord.foxyflow_charge_item_code}
        </>
      ) : null;
    },
  },
  {
    title: 'Contract Start/End',
    key: 'dates',
    width: '25%',
    render: (_, record) => {
      if ('children' in record) return null;

      const isMerged = record.type === 'merged';
      const isWireline = record.type === 'wireline';
      const mergedRecord = record as MergedRecord;
      const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
      const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

      if (isMerged || isWireline) {
        const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
        return (
          <DateRange 
            startDate={r.foxy_billingeffectivedate}
            endDate={r.foxy_estimatedenddate}
          />
        );
      }

      return residualRecord ? residualRecord.foxyflow_month : null;
    },
  },
  {
    title: 'Site Name',
    key: 'company',
    width: '15%',
    render: (_, record) => {
      if ('children' in record) return null;

      const isMerged = record.type === 'merged';
      const isWireline = record.type === 'wireline';
      const mergedRecord = record as MergedRecord;
      const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
      const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

      if (isMerged || isWireline) {
        const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
        return r.foxy_sitename;
      }

      return residualRecord ? residualRecord.foxyflow_rogerscompanyname : null;
    },
  },
  {
    title: 'Amount',
    key: 'amount',
    width: '10%',
    render: (_, record) => {
      if ('children' in record) return null;

      const isMerged = record.type === 'merged';
      const isWireline = record.type === 'wireline';
      const mergedRecord = record as MergedRecord;
      const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
      const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

      let value: string | undefined;
      if (isMerged) {
        value = mergedRecord.wirelineRecord.foxy_charges;
      } else if (isWireline) {
        value = wirelineRecord!.foxy_charges;
      } else if (residualRecord) {
        value = residualRecord.foxyflow_actuals;
      }

      if (!value) return null;
      const num = parseFloat(value.toString());
      return (
        <Tag color={isMerged ? 'purple' : isWireline ? 'green' : 'blue'}>
          {num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </Tag>
      );
    },
  }
];

export const ResidualTable: React.FC<ResidualTableProps> = ({ data }) => {
  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={false}
        scroll={{ x: 1500 }}
        size="middle"
        expandable={{
          defaultExpandAllRows: true,
        }}
      />
      <style>
        {`
          .ant-table-row-expand-icon-cell {
            padding-right: 0 !important;
          }
          .ant-table {
            border-radius: 8px !important;
          }
          .ant-table-container {
            border-radius: 8px !important;
            overflow: hidden;
          }
          .ant-table-content {
            border-radius: 8px !important;
          }
          .ant-table-body {
            border-radius: 0 0 8px 8px !important;
          }
          .ant-table-wrapper .ant-table-tbody > tr:last-child > td {
            border-bottom: none;
          }
        `}
      </style>
    </>
  );
};
