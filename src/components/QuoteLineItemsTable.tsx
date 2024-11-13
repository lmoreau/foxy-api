import React, { useMemo, useEffect, useState } from 'react';
import { Table, Form, message, Button, Tooltip, Space, Select, InputNumber } from 'antd';
import type { AlignType } from 'rc-table/lib/interface';
import { EditOutlined, DeleteOutlined, FileTextOutlined, ToolOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { QuoteLineItem } from 'types';
import DeleteConfirmationModal from 'components/DeleteConfirmationModal';
import ConfigurationModal from 'components/ConfigurationModal';
import RevenueTypeModal from 'components/RevenueTypeModal';
import { formatCurrency } from 'utils/formatters';
import { fetchProducts } from 'utils/api';
import useQuoteLineItems from 'hooks/useQuoteLineItems';
import CommentModal from './CommentModal';
import { revenueTypeMap } from '../utils/categoryMapper';
import { SorterResult } from 'antd/es/table/interface';
import { TablePaginationConfig } from 'antd/es/table';
import { FilterValue } from 'antd/es/table/interface';

interface QuoteLineItemsTableProps {
  initialLineItems: QuoteLineItem[];
  onUpdateLineItem: (updatedItem: QuoteLineItem) => void;
  onDeleteLineItem: (itemId: string) => void;
  triggerNewLine?: boolean;
  onNewLineComplete?: () => void;
  locationId?: string;
  quoteStage?: number;
}

const QuoteLineItemsTable: React.FC<QuoteLineItemsTableProps> = ({
  initialLineItems,
  onUpdateLineItem,
  onDeleteLineItem,
  triggerNewLine,
  onNewLineComplete,
  locationId,
  quoteStage
}) => {
  const [currentRecord, setCurrentRecord] = useState<QuoteLineItem | undefined>();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [currentLineItemId, setCurrentLineItemId] = useState('');
  const [sortedInfo, setSortedInfo] = useState<SorterResult<QuoteLineItem>>({
    columnKey: 'createdon',
    order: 'ascend'
  });

  const {
    lineItems,
    setLineItems,
    editingKey,
    deleteModalVisible,
    configModalVisible,
    revenueTypeModalVisible,
    products,
    loading,
    form,
    isEditing,
    isSaving,
    edit,
    cancel,
    save,
    handleDelete,
    confirmDelete,
    setConfigModalVisible,
    setRevenueTypeModalVisible,
    setDeleteModalVisible,
    setProducts,
    setLoading,
    addNewLine,
  } = useQuoteLineItems(initialLineItems, onUpdateLineItem, onDeleteLineItem, locationId);

  const fetchProductsData = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      return fetchedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to load products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<QuoteLineItem> | SorterResult<QuoteLineItem>[],
    _: any
  ) => {
    const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    setSortedInfo(currentSorter);
  };

  const productNameColumns = [
    {
      title: 'Product Name',
      dataIndex: ['foxy_Product', 'name'],
      key: 'productName',
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => {
        const nameA = a.foxy_Product?.name || '';
        const nameB = b.foxy_Product?.name || '';
        return nameA.localeCompare(nameB);
      },
      sortOrder: sortedInfo.columnKey === 'productName' ? sortedInfo.order : null,
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
                    
                    const searchWords = searchTerm.split(/\s+/);
                    return searchWords.every(word => productName.includes(word));
                  }}
                  style={{ width: '300px' }}
                  onFocus={() => {
                    if (products.length === 0) {
                      fetchProductsData().then((fetchedProducts) => {
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
              <>
                {text}
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
              </>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Revenue Type',
      dataIndex: 'foxy_revenuetype',
      key: 'revenueType',
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => {
        const typeA = revenueTypeMap[a.foxy_revenuetype] || '';
        const typeB = revenueTypeMap[b.foxy_revenuetype] || '';
        return typeA.localeCompare(typeB);
      },
      sortOrder: sortedInfo.columnKey === 'revenueType' ? sortedInfo.order : null,
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
              <>
                <span style={{ minWidth: '80px', display: 'inline-block' }}>{revenueType}</span>
                {showIcon && (
                  <Tooltip title={isDataComplete ? "Configuration Complete" : "Configuration Required"}>
                    <Button
                      icon={<ToolOutlined />}
                      onClick={() => {
                        setCurrentRecord(record);
                        setRevenueTypeModalVisible(true);
                      }}
                      type="text"
                      style={{ color: iconColor }}
                    />
                  </Tooltip>
                )}
              </>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Term',
      dataIndex: 'foxy_term',
      key: 'term',
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => (a.foxy_term || 0) - (b.foxy_term || 0),
      sortOrder: sortedInfo.columnKey === 'term' ? sortedInfo.order : null,
      render: (value: number, record: QuoteLineItem) => {
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
          record.foxy_term || 36
        );
      }
    },
    {
      title: 'Quantity',
      dataIndex: 'foxy_quantity',
      key: 'quantity',
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => (a.foxy_quantity || 0) - (b.foxy_quantity || 0),
      sortOrder: sortedInfo.columnKey === 'quantity' ? sortedInfo.order : null,
      render: (value: number, record: QuoteLineItem) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="foxy_quantity"
            style={{ margin: 0 }}
            initialValue={1}
            rules={[{ required: true, message: 'Quantity is required' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        ) : (
          record.foxy_quantity || 1
        );
      }
    },
    {
      title: 'Each',
      dataIndex: 'foxy_each',
      key: 'each',
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => (a.foxy_each || 0) - (b.foxy_each || 0),
      sortOrder: sortedInfo.columnKey === 'each' ? sortedInfo.order : null,
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
              onChange={(value) => {
                const quantity = form.getFieldValue('foxy_quantity') || 1;
                const each = value || 0;
                const term = form.getFieldValue('foxy_term') || 36;
                const calculatedMRR = quantity * each;
                const calculatedTCV = calculatedMRR * term;
                
                const updatedLineItems = lineItems.map(item => {
                  if (item.foxy_foxyquoterequestlineitemid === editingKey) {
                    return {
                      ...item,
                      foxy_mrr: calculatedMRR,
                      foxy_linetcv: calculatedTCV,
                      foxy_quantity: quantity,
                      foxy_term: term,
                      foxy_each: each
                    };
                  }
                  return item;
                });
                setLineItems(updatedLineItems);
              }}
            />
          </Form.Item>
        ) : (
          formatCurrency(record.foxy_each || 0)
        );
      }
    },
    {
      title: 'MRR',
      dataIndex: 'foxy_mrr',
      key: 'mrr',
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => (a.foxy_mrr || 0) - (b.foxy_mrr || 0),
      sortOrder: sortedInfo.columnKey === 'mrr' ? sortedInfo.order : null,
      render: (mrr: number, record: QuoteLineItem) => {
        if (isEditing(record)) {
          const quantity = form.getFieldValue('foxy_quantity') || 1;
          const each = form.getFieldValue('foxy_each') || 0;
          const calculatedMRR = quantity * each;
          return formatCurrency(calculatedMRR);
        }
        return formatCurrency(mrr);
      }
    },
    {
      title: 'TCV',
      dataIndex: 'foxy_linetcv',
      key: 'tcv',
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => (a.foxy_linetcv || 0) - (b.foxy_linetcv || 0),
      sortOrder: sortedInfo.columnKey === 'tcv' ? sortedInfo.order : null,
      render: (tcv: number, record: QuoteLineItem) => {
        if (isEditing(record)) {
          const quantity = form.getFieldValue('foxy_quantity') || 1;
          const each = form.getFieldValue('foxy_each') || 0;
          const term = form.getFieldValue('foxy_term') || 36;
          const calculatedMRR = quantity * each;
          const calculatedTCV = calculatedMRR * term;
          return formatCurrency(calculatedTCV);
        }
        return formatCurrency(tcv);
      }
    },
    {
      title: 'Margin',
      dataIndex: 'foxy_margin',
      key: 'margin',
      hidden: quoteStage !== 612100009,
      sorter: (a: QuoteLineItem, b: QuoteLineItem) => (a.foxy_margin || 0) - (b.foxy_margin || 0),
      sortOrder: sortedInfo.columnKey === 'margin' ? sortedInfo.order : null,
      render: (value: number, record: QuoteLineItem) => {
        const editable = isEditing(record) && quoteStage === 612100009;
        return editable ? (
          <Form.Item
            name="foxy_margin"
            style={{ margin: 0 }}
            rules={[{ required: true, message: 'Margin is required' }]}
          >
            <InputNumber
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={(value: string | undefined): number => {
                const parsed = value ? parseFloat(value.replace('%', '')) : 0;
                return isNaN(parsed) ? 0 : parsed;
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>
        ) : (
          quoteStage === 612100009 ? `${record.foxy_margin || 0}%` : null
        );
      }
    },
    {
      title: '',
      key: 'actions',
      align: 'center' as AlignType,
      render: (_: unknown, record: QuoteLineItem) => {
        const editable = isEditing(record);
        const saving = isSaving(record);
        const iconColor = record.foxy_comment ? '#1890ff' : '#d9d9d9';
        return (
          <Space>
            {editable ? (
              <>
                <Tooltip title="Save">
                  <Button
                    icon={<SaveOutlined />}
                    onClick={() => save(record.foxy_foxyquoterequestlineitemid)}
                    style={{ marginRight: 8 }}
                    type="link"
                    loading={saving}
                    disabled={saving}
                  />
                </Tooltip>
                <Tooltip title="Cancel">
                  <Button
                    icon={<CloseOutlined />}
                    onClick={cancel}
                    type="link"
                    disabled={saving}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Edit">
                  <Button
                    disabled={editingKey !== ''}
                    onClick={() => {
                      form.setFieldsValue({
                        ...record,
                        foxy_term: record.foxy_term || 36,
                        foxy_quantity: record.foxy_quantity || 1
                      });
                      edit(record);
                    }}
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
                    onClick={() => handleCommentClick(record)}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        );
      }
    }
  ];

  const totalMRR = useMemo(() => lineItems.reduce((sum: number, item: QuoteLineItem) => sum + item.foxy_mrr, 0), [lineItems]);
  const totalTCV = useMemo(() => lineItems.reduce((sum: number, item: QuoteLineItem) => sum + item.foxy_linetcv, 0), [lineItems]);

  useEffect(() => {
    if (triggerNewLine) {
      addNewLine();
      if (onNewLineComplete) {
        onNewLineComplete();
      }
    }
  }, [triggerNewLine, addNewLine, onNewLineComplete]);

  const handleCommentConfirm = (updatedComment: string) => {
    if (currentRecord && currentRecord.foxy_foxyquoterequestlineitemid) {
      const updatedItem: QuoteLineItem = { 
        ...currentRecord, 
        foxy_comment: updatedComment 
      };
      setLineItems(prevItems => 
        prevItems.map(item => 
          item.foxy_foxyquoterequestlineitemid === updatedItem.foxy_foxyquoterequestlineitemid 
            ? updatedItem 
            : item
        )
      );
      onUpdateLineItem(updatedItem);
    }
    setCommentModalVisible(false);
  };

  const handleCommentClick = (record: QuoteLineItem) => {
    setCurrentRecord(record);
    setCurrentComment(record.foxy_comment || '');
    setCurrentLineItemId(record.foxy_foxyquoterequestlineitemid);
    setCommentModalVisible(true);
  };

  const sortedLineItems = [...lineItems].sort((a, b) => {
    if (a.foxy_foxyquoterequestlineitemid.startsWith('temp-')) return 1;
    if (b.foxy_foxyquoterequestlineitemid.startsWith('temp-')) return -1;

    const dateA = new Date(a.createdon || 0).getTime();
    const dateB = new Date(b.createdon || 0).getTime();
    return dateA - dateB;
  });

  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <Form 
          form={form} 
          component={false}
          onValuesChange={(_, allValues) => {
            const quantity = allValues.foxy_quantity || 1;
            const each = allValues.foxy_each || 0;
            const term = allValues.foxy_term || 36;
            const calculatedMRR = quantity * each;
            const calculatedTCV = calculatedMRR * term;

            const updatedLineItems = lineItems.map(item => {
              if (item.foxy_foxyquoterequestlineitemid === editingKey) {
                return {
                  ...item,
                  ...allValues,
                  foxy_mrr: calculatedMRR,
                  foxy_linetcv: calculatedTCV
                };
              }
              return item;
            });
            setLineItems(updatedLineItems);
          }}
        >
          <Table
            columns={productNameColumns.filter(col => !col.hidden)}
            dataSource={sortedLineItems}
            rowKey="foxy_foxyquoterequestlineitemid"
            pagination={false}
            scroll={{ x: 'max-content' }}
            className="rounded-table"
            onChange={handleTableChange}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5}>
                    <strong>{formatCurrency(totalMRR)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}>
                    <strong>{formatCurrency(totalTCV)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Form>
      </div>

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
      <ConfigurationModal
        visible={configModalVisible}
        onOk={() => setConfigModalVisible(false)}
        onCancel={() => setConfigModalVisible(false)}
      />
      <RevenueTypeModal
        visible={revenueTypeModalVisible}
        onOk={() => {
          form.validateFields().then(values => {
            const updatedItem = { ...currentRecord, ...values };
            onUpdateLineItem(updatedItem);
            setRevenueTypeModalVisible(false);
          });
        }}
        onCancel={() => setRevenueTypeModalVisible(false)}
        initialValues={currentRecord}
      />
      <CommentModal
        visible={commentModalVisible}
        comment={currentComment}
        onCancel={() => setCommentModalVisible(false)}
        onConfirm={handleCommentConfirm}
        lineItemId={currentLineItemId}
      />
    </>
  );
};

export default QuoteLineItemsTable;
