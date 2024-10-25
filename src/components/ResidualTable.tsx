import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRecord, WirelineRecord, ResidualRecord, MergedRecord } from '../types/residualTypes';
import { formatDescription } from '../utils/residualUtils';

interface ResidualTableProps {
  data: TableRecord[];
}

const columns: ColumnsType<TableRecord> = [
  {
    title: 'Description/Product',
    key: 'description',
    width: '30%',
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

      return (
        <>
          <Tag color={isMerged ? 'purple' : isWireline ? 'green' : 'blue'}>
            {isMerged ? 'Merged' : isWireline ? 'Wireline' : 'Residual'}
          </Tag>
          <span>&nbsp;</span>
          {isMerged ? formatDescription(mergedRecord.wirelineRecord) :
           isWireline ? formatDescription(wirelineRecord!) :
           residualRecord?.foxyflow_product}
        </>
      );
    },
  },
  {
    title: 'Service Details',
    key: 'serviceDetails',
    width: '20%',
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
          <>
            Service ID: {r.foxy_serviceid}<br />
            {r.foxy_addressline1 && (
              <Tooltip title={`${r.foxy_city}, ${r.foxy_province} ${r.foxy_postalcode}`}>
                {r.foxy_addressline1}
              </Tooltip>
            )}
          </>
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
    title: 'Dates',
    key: 'dates',
    width: '20%',
    render: (_, record) => {
      if ('children' in record) return null;

      const isMerged = record.type === 'merged';
      const isWireline = record.type === 'wireline';
      const mergedRecord = record as MergedRecord;
      const wirelineRecord = isWireline ? record as WirelineRecord : undefined;
      const residualRecord = record.type === 'residual' ? record as ResidualRecord : undefined;

      if (isMerged || isWireline) {
        const r = isMerged ? mergedRecord.wirelineRecord : wirelineRecord!;
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };
        
        return (
          <>
            <Tag color="purple">
              Billing Start: {formatDate(r.foxy_billingeffectivedate)}
            </Tag>
            <br />
            <Tag color="red">
              Contract End: {formatDate(r.foxy_estimatedenddate)}
            </Tag>
          </>
        );
      }

      return residualRecord ? residualRecord.foxyflow_month : null;
    },
  },
  {
    title: 'Company Info',
    key: 'company',
    width: '20%',
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
          <>
            {r.foxy_companyname}<br />
            Site: {r.foxy_sitename}
          </>
        );
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
        `}
      </style>
    </>
  );
};
