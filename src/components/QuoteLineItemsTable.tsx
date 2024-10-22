import React, { useMemo, useState } from 'react';
import { Table, InputNumber, Select, message, Button, Tooltip, Modal, Form, DatePicker, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, ToolOutlined } from '@ant-design/icons';
import './QuoteLineItemsTable.css';
import { revenueTypeMap } from '../utils/categoryMapper';
import dayjs from 'dayjs';

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
  onUpdateLineItem: (updatedItem: QuoteLineItem) => void;
  onDeleteLineItem: (itemId: string) => void;
}

const QuoteLineItemsTable: React.FC<QuoteLineItemsTableProps> = ({ 
  initialLineItems, 
  onUpdateLineItem, 
  onDeleteLineItem 
}) => {
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(initialLineItems);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingKey, setEditingKey] = useState<string>('');
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(false);

  const [form] = Form.useForm();

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

  const isEditing = (record: QuoteLineItem) => record.foxy_foxyquoterequestlineitemid === editingKey;

  const edit = (record: QuoteLineItem) => {
    form.setFieldsValue({ ...record, foxy_renewaldate: dayjs(record.foxy_renewaldate) });
    setEditingKey(record.foxy_foxyquoterequestlineitemid);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: string) => {
    try {
      const row = await form.validateFields();
      const newData = [...lineItems];
      const index = newData.findIndex(item => key === item.foxy_foxyquoterequestlineitemid);
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
          foxy_renewaldate: row.foxy_renewaldate.format('YYYY-MM-DD'),
        };
        newData.splice(index, 1, updatedItem);
        setLineItems(newData);
        setEditingKey('');
        onUpdateLineItem(updatedItem);
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const newData = lineItems.filter(item => item.foxy_foxyquoterequestlineitemid !== itemToDelete);
      setLineItems(newData);
      onDeleteLineItem(itemToDelete);
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const columns: ColumnsType<QuoteLineItem> = [
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
                  onSearch={fetchProducts}
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

  const totalMRR = useMemo(() => lineItems.reduce((sum, item) => sum + item.foxy_mrr, 0), [lineItems]);
  const totalTCV = useMemo(() => lineItems.reduce((sum, item) => sum + item.foxy_linetcv, 0), [lineItems]);

  return (
    <>
      <Form form={form} component={false}>
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
                <Table.Summary.Cell index={9} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Form>
      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      >
        <p>Are you sure you want to delete this line item? This action cannot be undone.</p>
      </Modal>
      <Modal
        title="Configuration Required"
        open={configModalVisible}
        onOk={() => setConfigModalVisible(false)}
        onCancel={() => setConfigModalVisible(false)}
      >
        <p>Additional configuration is required for this item. (Placeholder for future implementation)</p>
      </Modal>
    </>
  );
};

export default QuoteLineItemsTable;
