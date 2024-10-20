import React, { useMemo } from 'react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface QuoteLineItem {
  foxy_foxyquoterequestlineitemid: string;
  foxy_quantity: number;
  foxy_each: number;
  foxy_mrr: number;
  foxy_linetcv: number;
  foxy_term: number;
  foxy_revenuetype: number;
  foxy_renewaltype: string;
  foxy_renewaldate: string;
  foxy_Product: {
    name: string;
  };
}

interface QuoteLineItemsTableProps {
  lineItems: QuoteLineItem[];
}

const QuoteLineItemsTable: React.FC<QuoteLineItemsTableProps> = ({ lineItems }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const columns: ColumnsType<QuoteLineItem> = [
    {
      title: 'Product',
      dataIndex: ['foxy_Product', 'name'],
      key: 'product',
    },
    {
      title: 'Quantity',
      dataIndex: 'foxy_quantity',
      key: 'foxy_quantity',
    },
    {
      title: 'Each',
      dataIndex: 'foxy_each',
      key: 'foxy_each',
      render: (price: number) => formatCurrency(price),
    },
    {
      title: 'MRR',
      dataIndex: 'foxy_mrr',
      key: 'foxy_mrr',
      render: (mrr: number) => formatCurrency(mrr),
    },
    {
      title: 'TCV',
      dataIndex: 'foxy_linetcv',
      key: 'foxy_linetcv',
      render: (tcv: number) => formatCurrency(tcv),
    },
    {
      title: 'Term',
      dataIndex: 'foxy_term',
      key: 'foxy_term',
    },
    {
      title: 'Revenue Type',
      dataIndex: 'foxy_revenuetype',
      key: 'foxy_revenuetype',
      render: (type: number) => {
        switch (type) {
          case 612100003:
            return 'Renewal';
          // Add other cases as needed
          default:
            return 'Unknown';
        }
      },
    },
    {
      title: 'Renewal Type',
      dataIndex: 'foxy_renewaltype',
      key: 'foxy_renewaltype',
    },
    {
      title: 'Renewal Date',
      dataIndex: 'foxy_renewaldate',
      key: 'foxy_renewaldate',
    },
  ];

  const totalMRR = useMemo(() => lineItems.reduce((sum, item) => sum + item.foxy_mrr, 0), [lineItems]);
  const totalTCV = useMemo(() => lineItems.reduce((sum, item) => sum + item.foxy_linetcv, 0), [lineItems]);

  return (
    <Table
      columns={columns}
      dataSource={lineItems}
      rowKey="foxy_foxyquoterequestlineitemid"
      pagination={false}
      style={{ margin: '0 -16px' }}
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}>
              <strong>Total</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              <strong>{formatCurrency(totalMRR)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4}>
              <strong>{formatCurrency(totalTCV)}</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
};

export default QuoteLineItemsTable;
