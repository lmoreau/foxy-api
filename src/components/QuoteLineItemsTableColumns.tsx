import React from 'react';
import { InputNumber, Select, Button, Tooltip, Form, DatePicker, Space } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, ToolOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { QuoteLineItem, Product } from '../types';
import { revenueTypeMap } from '../utils/categoryMapper';
import { formatCurrency } from '../utils/formatters';

const getQuoteLineItemsColumns = (
  isEditing: (record: QuoteLineItem) => boolean,
  edit: (record: QuoteLineItem) => void,
  save: (key: string) => void,
  cancel: () => void,
  handleDelete: (id: string) => void,
  editingKey: string,
  setConfigModalVisible: (visible: boolean) => void,
  setRevenueTypeModalVisible: (visible: boolean) => void,
  fetchProducts: (search: string) => Promise<Product[]>,
  products: Product[],
  loading: boolean
): ColumnsType<QuoteLineItem> => [
  {
    title: 'Product',
    dataIndex: ['foxy_Product', 'name'],
    key: 'product',
    render: (text: string, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return (
        <Space>
          {editable ? (
            <Form.Item
              name={['foxy_Product', 'name']}
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Product is required' }]}
            >
              <Select
                showSearch
                placeholder="Select a product"
                onSearch={(value) => {
                  fetchProducts(value).then((products) => {
                    // Update the products state here if needed
                  });
                }}
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
            </Form.Item>
          ) : (
            text
          )}
          <Tooltip title="Configuration Required">
            <Button
              icon={<ToolOutlined />}
              onClick={() => setConfigModalVisible(true)}
              type="text"
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        </Space>
      );
    },
  },
  {
    title: 'Quantity',
    dataIndex: 'foxy_quantity',
    key: 'foxy_quantity',
    render: (value: number, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return editable ? (
        <Form.Item
          name="foxy_quantity"
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Quantity is required' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      ) : (
        value
      );
    },
  },
  {
    title: 'Each',
    dataIndex: 'foxy_each',
    key: 'foxy_each',
    render: (value: number, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return editable ? (
        <Form.Item
          name="foxy_each"
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Each is required' }]}
        >
          <InputNumber
            min={0}
            formatter={value => `$${value}`}
            parser={(value: string | undefined) => {
              const parsedValue = value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0;
              return isNaN(parsedValue) ? 0 : parsedValue;
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
      ) : (
        formatCurrency(value)
      );
    },
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
    render: (value: number, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return editable ? (
        <Form.Item
          name="foxy_term"
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Term is required' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      ) : (
        value
      );
    },
  },
  {
    title: 'Revenue Type',
    dataIndex: 'foxy_revenuetype',
    key: 'foxy_revenuetype',
    render: (type: number, record: QuoteLineItem) => {
      const editable = isEditing(record);
      const revenueType = revenueTypeMap[type];
      const showIcon = revenueType === 'Renewal' || revenueType === 'Upsell';
      
      const isDataComplete = record.foxy_mrr && 
                             record.foxy_quantity && 
                             record.foxy_renewaldate && 
                             record.foxy_renewaltype;
      
      const iconColor = isDataComplete ? '#52c41a' : '#ff4d4f';
      
      return (
        <Space>
          {editable ? (
            <Form.Item
              name="foxy_revenuetype"
              style={{ margin: 0 }}
              rules={[{ required: true, message: 'Revenue Type is required' }]}
            >
              <Select style={{ width: '100%' }}>
                {Object.entries(revenueTypeMap).map(([value, label]) => (
                  <Select.Option key={value} value={parseInt(value)}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            revenueType
          )}
          {showIcon && (
            <Tooltip title="Configuration Required">
              <Button
                icon={<ToolOutlined />}
                onClick={() => setRevenueTypeModalVisible(true)}
                type="text"
                style={{ color: iconColor }}
              />
            </Tooltip>
          )}
        </Space>
      );
    },
  },
  {
    title: 'Renewal Type',
    dataIndex: 'foxy_renewaltype',
    key: 'foxy_renewaltype',
    render: (text: string, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return editable ? (
        <Form.Item
          name="foxy_renewaltype"
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Renewal Type is required' }]}
        >
          <Select style={{ width: '100%' }}>
            <Select.Option value="Early Renewal">Early Renewal</Select.Option>
            <Select.Option value="Within 20% of Contract End">Within 20% of Contract End</Select.Option>
          </Select>
        </Form.Item>
      ) : (
        text
      );
    },
  },
  {
    title: 'Renewal Date',
    dataIndex: 'foxy_renewaldate',
    key: 'foxy_renewaldate',
    render: (date: string, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return editable ? (
        <Form.Item
          name="foxy_renewaldate"
          style={{ margin: 0 }}
          rules={[{ required: true, message: 'Renewal Date is required' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      ) : (
        date
      );
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return editable ? (
        <span>
          <Tooltip title="Save">
            <Button
              icon={<SaveOutlined />}
              onClick={() => save(record.foxy_foxyquoterequestlineitemid)}
              style={{ marginRight: 8 }}
              type="link"
            />
          </Tooltip>
          <Tooltip title="Cancel">
            <Button
              icon={<CloseOutlined />}
              onClick={cancel}
              type="link"
            />
          </Tooltip>
        </span>
      ) : (
        <span>
          <Tooltip title="Edit">
            <Button
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              icon={<EditOutlined />}
              type="link"
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              onClick={() => handleDelete(record.foxy_foxyquoterequestlineitemid)}
              icon={<DeleteOutlined />}
              type="link"
              style={{ color: '#ff4d4f' }}
            />
          </Tooltip>
        </span>
      );
    },
  },
];

export default getQuoteLineItemsColumns;
