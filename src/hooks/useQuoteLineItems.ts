import { useState } from 'react';
import { Form } from 'antd';
import { QuoteLineItem, Product } from '../types';
import dayjs from 'dayjs';

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
  };
};

export default useQuoteLineItems;
