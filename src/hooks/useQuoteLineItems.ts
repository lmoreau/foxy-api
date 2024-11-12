import { useState } from 'react';
import { Form } from 'antd';
import { QuoteLineItem, Product } from '../types';
import dayjs from 'dayjs';
import { fetchProducts } from '../utils/api';

const useQuoteLineItems = (
  initialLineItems: QuoteLineItem[],
  onUpdateLineItem: (updatedItem: QuoteLineItem) => void,
  onDeleteLineItem: (itemId: string) => void
) => {
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>(initialLineItems);
  const [editingKey, setEditingKey] = useState<string>('');
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(false);
  const [revenueTypeModalVisible, setRevenueTypeModalVisible] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = Form.useForm();

  const isEditing = (record: QuoteLineItem) => record.foxy_foxyquoterequestlineitemid === editingKey;

  const edit = (record: QuoteLineItem) => {
    form.setFieldsValue({ ...record, foxy_renewaldate: dayjs(record.foxy_renewaldate) });
    setEditingKey(record.foxy_foxyquoterequestlineitemid);
  };

  const cancel = () => {
    form.resetFields();
    setEditingKey('');
    setLineItems(prev => prev.filter(item => !item.foxy_foxyquoterequestlineitemid.startsWith('temp-')));
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

    const newItem: QuoteLineItem = {
      foxy_foxyquoterequestlineitemid: `temp-${Date.now()}`,
      foxy_quantity: 1,
      foxy_each: 0,
      foxy_mrr: 0,
      foxy_linetcv: 0,
      foxy_term: 12,
      foxy_revenuetype: 0,
      foxy_renewaltype: '',
      foxy_renewaldate: '',
      foxy_Product: {
        name: ''
      }
    };

    setLineItems(prev => [...prev, newItem]);
    setEditingKey(newItem.foxy_foxyquoterequestlineitemid);
    form.setFieldsValue(newItem);
  };

  return {
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
    addNewLine,
  };
};

export default useQuoteLineItems;
