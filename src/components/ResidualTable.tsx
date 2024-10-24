import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TableRecord, WirelineRecord, ResidualRecord } from '../types/residualTypes';
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
      
      const isWireline = 'foxy_description' in record;
      return (
        <>
          <Tag color={isWireline ? 'green' : 'blue'}>
            {isWireline ? 'Wireline' : 'Residual'}
          </Tag>
          {isWireline ? formatDescription(record as WirelineRecord) : record.foxyflow_product}
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
      
      const isWireline = 'foxy_description' in record;
      if (isWireline) {
        const wirelineRecord = record as WirelineRecord;
        return (
          <>
            Service ID: {wirelineRecord.foxy_serviceid}<br />
            {wirelineRecord.foxy_addressline1 && (
              <Tooltip title={`${wirelineRecord.foxy_city}, ${wirelineRecord.foxy_province} ${wirelineRecord.foxy_postalcode}`}>
                {wirelineRecord.foxy_addressline1}
              </Tooltip>
            )}
          </>
        );
      }
      
      const residualRecord = record as ResidualRecord;
      return (
        <>
          Billing Number: {residualRecord.foxyflow_billingnumber}<br />
          Code: {residualRecord.foxyflow_charge_item_code}
        </>
      );
    },
  },
  {
    title: 'Dates',
    key: 'dates',
    width: '20%',
    render: (_, record) => {
      if ('children' in record) return null;
      
      const isWireline = 'foxy_description' in record;
      if (isWireline) {
        const wirelineRecord = record as WirelineRecord;
        return (
          <>
            Renewal: {wirelineRecord.foxyflow_estrenewaldtgible}<br />
            End: {wirelineRecord.foxy_estimatedenddate}<br />
            Billing: {wirelineRecord.foxy_billingeffectivedate}
          </>
        );
      }
      
      return (record as ResidualRecord).foxyflow_month;
    },
  },
  {
    title: 'Company Info',
    key: 'company',
    width: '20%',
    render: (_, record) => {
      if ('children' in record) return null;
      
      const isWireline = 'foxy_description' in record;
      if (isWireline) {
        const wirelineRecord = record as WirelineRecord;
        return (
          <>
            {wirelineRecord.foxy_companyname}<br />
            Owner: {wirelineRecord.foxy_accountowner}<br />
            Site: {wirelineRecord.foxy_sitename}
          </>
        );
      }
      
      return (record as ResidualRecord).foxyflow_rogerscompanyname;
    },
  },
  {
    title: 'Amount',
    key: 'amount',
    width: '10%',
    render: (_, record) => {
      if ('children' in record) return null;
      
      const isWireline = 'foxy_description' in record;
      const value = isWireline 
        ? (record as WirelineRecord).foxy_charges
        : (record as ResidualRecord).foxyflow_actuals;
      
      if (!value) return null;
      const num = parseFloat(value.toString());
      return (
        <Tag color={isWireline ? 'green' : 'blue'}>
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
