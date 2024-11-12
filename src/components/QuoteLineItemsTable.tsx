import React, { useMemo, useEffect, useState } from 'react';
import { Table, Form, message, Button, Tooltip, Space } from 'antd';
import type { AlignType } from 'rc-table/lib/interface';
import { EditOutlined, DeleteOutlined, FileTextOutlined, ToolOutlined } from '@ant-design/icons';
import { QuoteLineItem } from 'types';
import getQuoteLineItemsColumns from 'components/QuoteLineItemsTableColumns';
import DeleteConfirmationModal from 'components/DeleteConfirmationModal';
import ConfigurationModal from 'components/ConfigurationModal';
import RevenueTypeModal from 'components/RevenueTypeModal';
import { formatCurrency } from 'utils/formatters';
import { fetchProducts } from 'utils/api';
import useQuoteLineItems from 'hooks/useQuoteLineItems';
import CommentModal from './CommentModal';
import { revenueTypeMapper } from 'utils/constants/revenueTypeMapper';
import { revenueTypeMap } from '../utils/categoryMapper';

interface QuoteLineItemsTableProps {
  initialLineItems: QuoteLineItem[];
  onUpdateLineItem: (updatedItem: QuoteLineItem) => void;
  onDeleteLineItem: (itemId: string) => void;
  triggerNewLine?: boolean;
  onNewLineComplete?: () => void;
}

const QuoteLineItemsTable: React.FC<QuoteLineItemsTableProps> = ({
  initialLineItems,
  onUpdateLineItem,
  onDeleteLineItem,
  triggerNewLine,
  onNewLineComplete,
}) => {
  const [currentRecord, setCurrentRecord] = useState<QuoteLineItem | undefined>();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState('');
  const [currentLineItemId, setCurrentLineItemId] = useState('');

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
  } = useQuoteLineItems(initialLineItems, onUpdateLineItem, onDeleteLineItem);

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

  const columns = getQuoteLineItemsColumns(
    isEditing,
    edit,
    save,
    cancel,
    handleDelete,
    editingKey,
    setConfigModalVisible,
    (visible: boolean, record?: QuoteLineItem) => {
      setCurrentRecord(record);
      setRevenueTypeModalVisible(visible);
    },
    fetchProductsData,
    products,
    loading,
    setProducts,
    form,
    (visible: boolean, comment?: string, lineItemId?: string) => {
      const record = lineItems.find(item => item.foxy_foxyquoterequestlineitemid === lineItemId);
      setCurrentRecord(record);
      setCurrentComment(comment || '');
      setCurrentLineItemId(lineItemId || '');
      setCommentModalVisible(visible);
    }
  );

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

  const productNameColumns = [
    {
      title: 'Product Name',
      dataIndex: ['foxy_Product', 'name'],
      key: 'productName'
    },
    {
      title: 'Revenue Type',
      dataIndex: 'foxy_revenuetype',
      key: 'revenueType',
      render: (type: number, record: QuoteLineItem) => {
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
          </Space>
        );
      }
    },
    {
      title: 'Term',
      dataIndex: 'foxy_term',
      key: 'term'
    },
    {
      title: 'Quantity',
      dataIndex: 'foxy_quantity',
      key: 'quantity'
    },
    {
      title: 'Each',
      dataIndex: 'foxy_each',
      key: 'each',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'MRR',
      dataIndex: 'foxy_mrr',
      key: 'mrr',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: 'TCV',
      dataIndex: 'foxy_linetcv',
      key: 'tcv',
      render: (value: number) => formatCurrency(value)
    },
    {
      title: '',
      key: 'actions',
      align: 'center' as AlignType,
      render: (_: any, record: QuoteLineItem) => {
        const iconColor = record.foxy_comment ? '#1890ff' : '#d9d9d9';
        return (
          <Space>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                type="link"
                style={{ marginRight: 8 }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                icon={<DeleteOutlined />}
                type="link"
                style={{ color: '#ff4d4f', marginRight: 8 }}
              />
            </Tooltip>
            <Tooltip title="Notes">
              <Button
                icon={<FileTextOutlined style={{ color: iconColor }} />}
                type="text"
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  return (
    <>
      <Form 
        form={form} 
        component={false}
        onValuesChange={(_, allValues) => {
          const updatedLineItems = lineItems.map(item => {
            if (item.foxy_foxyquoterequestlineitemid === editingKey) {
              return {
                ...item,
                ...allValues,
                foxy_mrr: (allValues.foxy_quantity || 0) * (allValues.foxy_each || 0),
                foxy_linetcv: (allValues.foxy_quantity || 0) * (allValues.foxy_each || 0) * (allValues.foxy_term || 36)
              };
            }
            return item;
          });
          setLineItems(updatedLineItems);
        }}
      >
        <Table
          columns={columns}
          dataSource={lineItems}
          rowKey="foxy_foxyquoterequestlineitemid"
          pagination={false}
          scroll={{ x: 'max-content' }}
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

      <div style={{ marginTop: '20px' }}>
        <Table
          columns={productNameColumns}
          dataSource={lineItems}
          rowKey="foxy_foxyquoterequestlineitemid"
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="rounded-table"
        />
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
