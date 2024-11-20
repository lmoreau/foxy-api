import { useState } from 'react';
import { Form, message } from 'antd';
import { QuoteLineItem, Product } from '../types';
import dayjs from 'dayjs';
import { fetchProducts, createQuoteLineItem, deleteQuoteLineItem, updateQuoteLineItem } from '../utils/api';

const useQuoteLineItems = (
  initialLineItems: QuoteLineItem[],
  onUpdateLineItem: (updatedItem: QuoteLineItem) => void,
  onDeleteLineItem: (itemId: string) => void,
  locationId?: string
) => {
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(initialLineItems);
  const [editingKey, setEditingKey] = useState<string>('');
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(false);
  const [revenueTypeModalVisible, setRevenueTypeModalVisible] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form] = Form.useForm();

  const isEditing = (record: QuoteLineItem) => record.foxy_foxyquoterequestlineitemid === editingKey;
  const isSaving = (record: QuoteLineItem) => record.foxy_foxyquoterequestlineitemid === savingId;
  const isDeleting = (record: QuoteLineItem) => record.foxy_foxyquoterequestlineitemid === deletingId;

  const edit = (record: QuoteLineItem) => {
    const formValues = {
      ...record,
      foxy_renewaldate: record.foxy_renewaldate ? dayjs(record.foxy_renewaldate) : undefined
    };
    form.setFieldsValue(formValues);
    setEditingKey(record.foxy_foxyquoterequestlineitemid);
  };

  const cancel = () => {
    form.resetFields();
    setEditingKey('');
    setLineItems(prev => prev.filter(item => !item.foxy_foxyquoterequestlineitemid.startsWith('temp-')));
  };

  const save = async (key: string) => {
    try {
      setSavingId(key);
      message.loading({ content: 'Saving line item...', key: 'saveLineItem', duration: 0 });
      
      const row = await form.validateFields();
      const newData = [...lineItems];
      const index = newData.findIndex(item => key === item.foxy_foxyquoterequestlineitemid);
      
      if (index > -1) {
        const item = newData[index];
        const isNewItem = item.foxy_foxyquoterequestlineitemid.startsWith('temp-');
        
        // Calculate MRR and TCV
        const quantity = row.foxy_quantity || 1;
        const each = row.foxy_each || 0;
        const term = row.foxy_term || 36;
        const calculatedMRR = quantity * each;
        const calculatedTCV = calculatedMRR * term;

        // Get the selected product
        const selectedProduct = products.find(p => p.name === row.foxy_Product?.name);

        if (isNewItem) {
          if (!locationId || !selectedProduct?.productid) {
            message.error({ content: 'Missing required location or product information', key: 'saveLineItem' });
            return;
          }

          const lineItemData = {
            _foxy_foxyquoterequestlocation_value: locationId,
            _foxy_product_value: selectedProduct.productid,
            foxy_quantity: quantity,
            foxy_each: each,
            foxy_mrr: calculatedMRR,
            foxy_linetcv: calculatedTCV,
            foxy_term: term,
            foxy_revenuetype: row.foxy_revenuetype || 0,
            foxy_renewaltype: row.foxy_renewaltype || '',
            foxy_renewaldate: row.foxy_renewaldate?.format('YYYY-MM-DD') || '',
            foxy_existingqty: row.foxy_existingqty || 0,
            foxy_existingmrr: row.foxy_existingmrr || 0
          };

          try {
            const createdItem = await createQuoteLineItem(lineItemData);
            const itemWithProduct = {
              ...createdItem,
              foxy_Product: selectedProduct
            };
            newData[index] = itemWithProduct;
            setLineItems(newData);
            onUpdateLineItem(itemWithProduct);
            message.success({ content: 'Line item created successfully', key: 'saveLineItem' });
          } catch (error) {
            message.error({ content: 'Failed to create line item', key: 'saveLineItem' });
            console.error('Create line item error:', error);
            return;
          }
        } else {
          // Remove foxy_Product from row data to avoid deep update error
          const { foxy_Product, ...rowWithoutProduct } = row;
          
          const updatedItem = {
            id: item.foxy_foxyquoterequestlineitemid,
            ...rowWithoutProduct,
            foxy_mrr: calculatedMRR,
            foxy_linetcv: calculatedTCV,
            foxy_renewaldate: row.foxy_renewaldate?.format('YYYY-MM-DD') || ''
          };
          
          try {
            await updateQuoteLineItem(updatedItem);
            const updatedItemWithProduct = {
              ...item, // Start with all existing item fields
              ...updatedItem, // Override with updated fields
              foxy_Product: item.foxy_Product, // Preserve the product information
              foxy_foxyquoterequestlineitemid: item.foxy_foxyquoterequestlineitemid // Ensure ID is preserved
            };
            newData[index] = updatedItemWithProduct; // Update local state
            setLineItems(newData); // Set the updated state
            onUpdateLineItem(updatedItemWithProduct);
            message.success({ content: 'Line item updated successfully', key: 'saveLineItem' });
          } catch (error) {
            message.error({ content: 'Failed to update line item', key: 'saveLineItem' });
            console.error('Update line item error:', error);
            return;
          }
        }

        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
      message.error({ content: 'Failed to save line item', key: 'saveLineItem' });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      setDeletingId(itemToDelete);
      try {
        await deleteQuoteLineItem(itemToDelete);
        // Update local state first
        const newData = lineItems.filter(item => item.foxy_foxyquoterequestlineitemid !== itemToDelete);
        setLineItems(newData);
        // Then notify parent
        onDeleteLineItem(itemToDelete);
        message.success('Line item deleted successfully');
      } catch (error) {
        // If the delete fails because it's a temporary ID, just remove it from local state
        if (itemToDelete.startsWith('temp-')) {
          const newData = lineItems.filter(item => item.foxy_foxyquoterequestlineitemid !== itemToDelete);
          setLineItems(newData);
          message.success('Line item removed');
        } else {
          message.error('Failed to delete line item');
          console.error('Delete error:', error);
        }
      } finally {
        setDeleteModalVisible(false);
        setItemToDelete(null);
        setDeletingId(null);
      }
    }
  };

  const addNewLine = async () => {
    cancel();

    if (products.length === 0) {
      setLoading(true);
      try {
        const fetchedProducts = await fetchProducts('foxy_category ne 612100004');
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    const newLineItem: QuoteLineItem = {
      foxy_foxyquoterequestlineitemid: `temp-${Date.now()}`,
      foxy_mrr: 0,
      foxy_linetcv: 0,
      foxy_term: 36,
      foxy_revenuetype: undefined as unknown as number,
      foxy_renewaltype: '',
      foxy_renewaldate: '',
      foxy_existingqty: 0,
      foxy_existingmrr: 0,
      foxy_quantity: 1,
      foxy_each: 0
    };

    setLineItems(prev => [...prev, newLineItem]);
    setEditingKey(newLineItem.foxy_foxyquoterequestlineitemid);
    form.setFieldsValue(newLineItem);
  };

  return {
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
    isDeleting,
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
  };
};

export default useQuoteLineItems;
