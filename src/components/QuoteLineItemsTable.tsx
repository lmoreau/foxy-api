import React from 'react';
import { Table } from 'antd';

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
  const columns = [
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
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'MRR',
      dataIndex: 'foxy_mrr',
      key: 'foxy_mrr',
      render: (mrr: number) => `$${mrr.toFixed(2)}`,
    },
    {
      title: 'TCV',
      dataIndex: 'foxy_linetcv',
      key: 'foxy_linetcv',
      render: (tcv: number) => `$${tcv.toFixed(2)}`,
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

  return (
    <Table
      columns={columns}
      dataSource={lineItems}
      rowKey="foxy_foxyquoterequestlineitemid"
      pagination={false}
    />
  );
};

export default QuoteLineItemsTable;
