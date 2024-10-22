import React, { useMemo } from 'react';
import { Table, Form } from 'antd';
import { QuoteLineItem, Product } from 'types';
import getQuoteLineItemsColumns from 'components/QuoteLineItemsTableColumns';
import DeleteConfirmationModal from 'components/DeleteConfirmationModal';
import ConfigurationModal from 'components/ConfigurationModal';
import RevenueTypeModal from 'components/RevenueTypeModal';
import { formatCurrency } from 'utils/formatters';
import { fetchProducts } from 'utils/api';
import useQuoteLineItems from 'hooks/useQuoteLineItems';

interface QuoteLineItemsTableProps {
  initialLineItems: QuoteLineItem[];
  onUpdateLineItem: (updatedItem: QuoteLineItem) => void;
  onDeleteLineItem: (itemId: string) => void;
}

const QuoteLineItemsTable: React.FC<QuoteLineItemsTableProps> = ({
  initialLineItems,
  onUpdateLineItem,
  onDeleteLineItem,
}) => {
  const {
    lineItems,
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
  } = useQuoteLineItems(initialLineItems, onUpdateLineItem, onDeleteLineItem);

  const fetchProductsWrapper = async (search: string): Promise<Product[]> => {
    setLoading(true);
    try {
      const fetchedProducts = await fetchProducts(search);
      setProducts(fetchedProducts);
      return fetchedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
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
    setRevenueTypeModalVisible,
    fetchProductsWrapper,
    products,
    loading
  );

  const totalMRR = useMemo(() => lineItems.reduce((sum: number, item: QuoteLineItem) => sum + item.foxy_mrr, 0), [lineItems]);
  const totalTCV = useMemo(() => lineItems.reduce((sum: number, item: QuoteLineItem) => sum + item.foxy_linetcv, 0), [lineItems]);

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
        onOk={() => setRevenueTypeModalVisible(false)}
        onCancel={() => setRevenueTypeModalVisible(false)}
      />
    </>
  );
};

export default QuoteLineItemsTable;
