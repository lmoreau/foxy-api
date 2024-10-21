import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import QuoteLineItemsTable from './QuoteLineItemsTable';
import { QuoteLocation, QuoteLineItem } from '../types';
import { createNewLineItem, calculateTotals } from '../utils/quoteUtils';

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const columns = [
    {
      title: 'Quote Location',
      dataIndex: 'fullAddress',
      key: 'fullAddress',
      render: (text: string, record: QuoteLocation) => {
        const locationLineItems = lineItems[record.foxy_foxyquoterequestlocationid] || [];
        const { totalMRR, totalTCV } = calculateTotals({ [record.foxy_foxyquoterequestlocationid]: locationLineItems });
        
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{text}</strong>
            {expandedRowKeys.includes(record.foxy_foxyquoterequestlocationid) ? (
              <div>
                <Button type="default" disabled style={{ marginRight: '8px' }}>
                  Delete Row
                </Button>
                <Button type="primary" onClick={() => onAddLine(record.foxy_foxyquoterequestlocationid, createNewLineItem())}>
                  Add Product
                </Button>
              </div>
            ) : (
              <div>
                <span style={{ marginRight: '16px' }}>MRR: {formatCurrency(totalMRR)}</span>
                <span>TCV: {formatCurrency(totalTCV)}</span>
              </div>
            )}
          </div>
        );
      },
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
