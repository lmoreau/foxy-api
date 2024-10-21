import React, { useMemo, useState } from 'react';
import { Table, InputNumber, Select, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import './QuoteLineItemsTable.css'; // Import CSS for custom styles
import { revenueTypeMap } from '../utils/categoryMapper';

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

interface Product {
  name: string;
}

interface QuoteLineItemsTableProps {
  initialLineItems: QuoteLineItem[];
}

const QuoteLineItemsTable: React.FC<QuoteLineItemsTableProps> = ({ initialLineItems }) => {
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(initialLineItems);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProducts = async (search: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/listProductByRow?search=${encodeURIComponent(search)}`);
      if (response.ok) {
        const data: Product[] = await response.json();
        setProducts(data);
      } else {
        message.error('Failed to fetch products.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('An error occurred while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof QuoteLineItem, value: any, record: QuoteLineItem) => {
    const updatedItems = lineItems.map(item => {
      if (item.foxy_foxyquoterequestlineitemid === record.foxy_foxyquoterequestlineitemid) {
        if (key === 'foxy_Product') {
          return { ...item, foxy_Product: { name: value } };
        }
        return { ...item, [key]: value };
      }
      return item;
    });
    setLineItems(updatedItems);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const columns: ColumnsType<QuoteLineItem> = [
    {
      title: 'Product',
      dataIndex: ['foxy_Product', 'name'],
      key: 'product',
      render: (text: string, record: QuoteLineItem) => (
        <Select
          showSearch
          placeholder="Select a product"
          value={text || undefined}
          onSearch={fetchProducts}
          onChange={(value) => handleInputChange('foxy_Product', value, record)}
          filterOption={false}
          loading={loading}
          style={{ width: '100%' }}
        >
          {products.map(product => (
            <Select.Option key={product.name} value={product.name}>
              {product.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'foxy_quantity',
      key: 'foxy_quantity',
      render: (value: number, record: QuoteLineItem) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleInputChange('foxy_quantity', val, record)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Each',
      dataIndex: 'foxy_each',
      key: 'foxy_each',
      render: (value: number, record: QuoteLineItem) => (
        <InputNumber
          min={0}
          formatter={value => `$${value}`}
          parser={value => value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0}
          value={value}
          onChange={(val) => handleInputChange('foxy_each', val, record)}
          style={{ width: '100%' }}
        />
      ),
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
      render: (type: number, record: QuoteLineItem) => (
        <Select
          value={type}
          onChange={(value) => handleInputChange('foxy_revenuetype', value, record)}
          style={{ width: '100%' }}
        >
          {Object.entries(revenueTypeMap).map(([value, label]) => (
            <Select.Option key={value} value={parseInt(value)}>
              {label}
            </Select.Option>
          ))}
        </Select>
      ),
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
      className="custom-table"
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
            <Table.Summary.Cell index={5} />
            <Table.Summary.Cell index={6} />
            <Table.Summary.Cell index={7} />
            <Table.Summary.Cell index={8} />
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
};

export default QuoteLineItemsTable;
