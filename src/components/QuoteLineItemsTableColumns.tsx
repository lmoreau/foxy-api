import React from 'react';
import { InputNumber, Select, Button, Tooltip, Form, Space, FormInstance } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, ToolOutlined, FileTextOutlined } from '@ant-design/icons';
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
  setRevenueTypeModalVisible: (visible: boolean, record?: QuoteLineItem) => void,
  fetchProducts: () => Promise<Product[]>,
  products: Product[],
  loading: boolean,
  setProducts: (products: Product[]) => void,
  form: FormInstance,
  setCommentModalVisible: (visible: boolean, comment?: string) => void
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
                optionFilterProp="label"
                filterOption={(input, option) => {
                  if (!input || !option?.label || typeof option.label !== 'string') {
                    return false;
                  }
                  const productName = option.label.toLowerCase();
                  const searchTerm = input.toLowerCase().trim();
                  
                  // Only match if the product name contains all words in the search term
                  const searchWords = searchTerm.split(/\s+/);
                  return searchWords.every(word => productName.includes(word));
                }}
                style={{ width: '300px' }}
                onFocus={() => {
                  if (products.length === 0) {
                    fetchProducts().then((fetchedProducts) => {
                      const sortedProducts = fetchedProducts.sort((a, b) => 
                        a.name.localeCompare(b.name)
                      );
                      setProducts(sortedProducts);
                    });
                  }
                }}
                onClear={() => {
                  form.setFieldsValue({ foxy_Product: { name: '' } });
                }}
                allowClear
                defaultActiveFirstOption={false}
                showArrow={true}
                notFoundContent={loading ? 'Loading...' : 'No products found'}
                listHeight={400}
                virtual={false}
              >
                {products.map(product => (
                  <Select.Option 
                    key={product.name} 
                    value={product.name}
                    label={product.name}
                  >
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            text
          )}
          {record.foxy_Product?.crc9f_requiresconfiguration && (
            <Tooltip title="Configuration Required">
              <Button
                icon={<ToolOutlined />}
                onClick={() => setConfigModalVisible(true)}
                type="text"
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          )}
        </Space>
      );
    },
  },
  {
    title: 'Revenue Type',
    dataIndex: 'foxy_revenuetype',
    key: 'foxy_revenuetype',
    width: '200px',
    render: (type: number, record: QuoteLineItem) => {
      const editable = isEditing(record);
      const revenueType = revenueTypeMap[type];
      const showIcon = revenueType === 'Renewal' || revenueType === 'Upsell';
      
      const isDataComplete = record.foxy_renewaldate && 
                            record.foxy_renewaltype && 
                            record.foxy_existingqty !== undefined && 
                            record.foxy_existingqty !== null &&
                            record.foxy_existingmrr !== undefined && 
                            record.foxy_existingmrr !== null;
      
      const iconColor = isDataComplete ? '#52c41a' : '#ff4d4f';
      
      return (
        <Space>
          {editable ? (
            <Form.Item
              name="foxy_revenuetype"
              style={{ margin: 0, minWidth: '150px' }}
            >
              <Select style={{ width: '100%' }}>
                {Object.entries(revenueTypeMap)
                  .filter(([_, label]) => label !== 'Net New')
                  .map(([value, label]) => (
                    <Select.Option key={value} value={parseInt(value)}>
                      {label}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          ) : (
            <span style={{ minWidth: '80px', display: 'inline-block' }}>{revenueType}</span>
          )}
          {showIcon && (
            <Tooltip title={isDataComplete ? "Configuration Complete" : "Configuration Required"}>
              <Button
                icon={<ToolOutlined />}
                onClick={() => setRevenueTypeModalVisible(true, record)}
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
    title: 'Term',
    dataIndex: 'foxy_term',
    key: 'foxy_term',
    render: (_, record: QuoteLineItem) => {
      const editable = isEditing(record);
      return editable ? (
        <Form.Item
          name="foxy_term"
          style={{ margin: 0 }}
          initialValue={36}
          rules={[{ required: true, message: 'Term is required' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      ) : (
        record.foxy_term
      );
    },
  },
  {
    title: 'Quantity',
    dataIndex: 'foxy_quantity',
    key: 'foxy_quantity',
    render: (_, record: QuoteLineItem) => {
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
        record.foxy_quantity
      );
    },
  },
  {
    title: 'Each',
    dataIndex: 'foxy_each',
    key: 'foxy_each',
    render: (_, record: QuoteLineItem) => {
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
        formatCurrency(record.foxy_each)
      );
    },
  },
  {
    title: 'MRR',
    dataIndex: 'foxy_mrr',
    key: 'foxy_mrr',
    render: (mrr: number, record: QuoteLineItem) => {
      if (isEditing(record)) {
        const quantity = form.getFieldValue('foxy_quantity') || 0;
        const each = form.getFieldValue('foxy_each') || 0;
        const calculatedMRR = quantity * each;
        return formatCurrency(calculatedMRR);
      }
      return formatCurrency(mrr);
    },
  },
  {
    title: 'TCV',
    dataIndex: 'foxy_linetcv',
    key: 'foxy_linetcv',
    render: (tcv: number, record: QuoteLineItem) => {
      if (isEditing(record)) {
        const quantity = form.getFieldValue('foxy_quantity') || 0;
        const each = form.getFieldValue('foxy_each') || 0;
        const term = form.getFieldValue('foxy_term') || 36;
        const calculatedMRR = quantity * each;
        const calculatedTCV = calculatedMRR * term;
        return formatCurrency(calculatedTCV);
      }
      return formatCurrency(tcv);
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_: any, record: QuoteLineItem) => {
      const editable = isEditing(record);
      const iconColor = record.foxy_comment ? '#1890ff' : '#d9d9d9'; // Blue if comment exists, grey otherwise

      return (
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
              style={{ color: '#ff4d4f', marginRight: 8 }}
            />
          </Tooltip>
          <Tooltip title="Notes">
            <Button
              icon={<FileTextOutlined style={{ color: iconColor }} />}
              type="text"
              onClick={() => setCommentModalVisible(true, record.foxy_comment)}
            />
          </Tooltip>
          {editable && (
            <>
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
            </>
          )}
        </span>
      );
    },
  },
];

export default getQuoteLineItemsColumns;
