import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import QuoteLineItemsTable from './QuoteLineItemsTable';
import { QuoteLocation, QuoteLineItem } from '../types';
import { createNewLineItem } from '../utils/quoteUtils';

interface LocationsTableProps {
  data: QuoteLocation[];
  lineItems: { [key: string]: QuoteLineItem[] };
  onAddLine: (locationId: string, newItem: QuoteLineItem) => void;
  expandAll: boolean;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  data,
  lineItems,
  onAddLine,
  expandAll,
}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    if (expandAll) {
      setExpandedRowKeys(data.map(location => location.foxy_foxyquoterequestlocationid));
    } else {
      setExpandedRowKeys([]);
    }
  }, [expandAll, data]);

  const columns = [
    {
      title: 'Quote Location',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
      render: (text: string, record: QuoteLocation) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{text}</strong>
          <Button type="primary" onClick={() => onAddLine(record.foxy_foxyquoterequestlocationid, createNewLineItem())}>
            Add Product
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="foxy_foxyquoterequestlocationid"
      expandable={{
        expandedRowKeys,
        onExpandedRowsChange: (newExpandedRows) => {
          setExpandedRowKeys(newExpandedRows as string[]);
        },
        expandedRowRender: (record) => (
          <QuoteLineItemsTable
            initialLineItems={lineItems[record.foxy_foxyquoterequestlocationid] || []}
          />
        ),
        rowExpandable: (record) => lineItems[record.foxy_foxyquoterequestlocationid]?.length > 0,
      }}
      showHeader={false}
      size="small"
    />
  );
};

export default LocationsTable;
